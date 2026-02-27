// /Users/zhangqiwei/Documents/01_dev-project/portfolio-monorepo/apps/harrychang-me/app/api/lab/waitlist/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@portfolio/lib/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendWaitlistConfirmationEmail } from '@portfolio/lib/lib/email';

const WaitlistSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  interests: z.array(z.string()).default([]),
  referralSource: z.string().nullish(),
  locale: z.string().default('en'),
  tier: z.string().optional(),
  utmSource: z.string().nullish(),
  utmMedium: z.string().nullish(),
  utmCampaign: z.string().nullish()
});

// --- Rate Limiting Configuration ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5;   // Limit to 5 requests per minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup expired entries every 5 minutes

// In-memory store for rate limiting
// Note: In a serverless environment (Vercel), this map persists only as long as the 
// lambda container is warm. This is sufficient to block high-frequency spam scripts.
// For distributed persistence, you would need Redis or a Database table.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();
let lastCleanup = Date.now();

// Helper: Get Client IP robustly
function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a list, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

// Helper: Prune expired entries to prevent memory leaks
function pruneRateLimitMap() {
  const now = Date.now();
  // Only scan for cleanup occasionally
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now - data.startTime > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(ip);
      }
    }
    lastCleanup = now;
  }
}

export async function POST(request: Request) {
  try {
    // 1. IP Extraction & Rate Limiting
    const ip = getClientIp(request);
    const now = Date.now();
    
    pruneRateLimitMap(); // Lazy cleanup trigger

    const rateData = rateLimitMap.get(ip) || { count: 0, startTime: now };

    // Reset window if the previous window has expired
    if (now - rateData.startTime > RATE_LIMIT_WINDOW) {
      rateData.count = 0;
      rateData.startTime = now;
    }

    // Check if limit exceeded
    if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
      console.warn(`[Waitlist] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Increment request count
    rateData.count++;
    rateLimitMap.set(ip, rateData);

    // 2. Request Validation & Processing
    const body = await request.json();
    const data = WaitlistSchema.parse(body);
    
    // Check if email already exists
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: data.email }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'This email has already submitted an application.' },
        { status: 400 }
      );
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Save to database
    const entry = await prisma.waitlistEntry.create({
      data: {
        ...data,
        verificationToken
      }
    });
    
    // Send confirmation email
    const emailResult = await sendWaitlistConfirmationEmail({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      locale: data.locale
    });

    // Dispatch to Discord Webhook
    const webhookUrl = process.env.DISCORD_LAB_WEBHOOK_URL;
    if (webhookUrl) {
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'No Name Provided';
      const interestsStr = data.interests.length > 0 ? data.interests.join(', ') : 'None';
      
      const discordMessage = [
        `**🚨 New Icarus Lab Application!**`,
        `> **Name:** ${name}`,
        `> **Email:** ${data.email}`,
        `> **Tier:** ${data.tier || 'Not specified'}`,
        `> **Interests:** ${interestsStr}`,
        `> **Locale:** ${data.locale}`
      ].join('\n');
      
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: discordMessage,
            username: "Icarus Lab Portal",
          }),
        });
      } catch (webhookError) {
        console.error('Failed to send Discord webhook:', webhookError);
      }
    }
    
    return NextResponse.json({ 
      success: true
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      // console.error('Validation error:', error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid form data. Please check your inputs.',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    
    // console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}