import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendWaitlistConfirmationEmail } from '@/lib/email';

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

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 5) { // Max 5 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log('Received waitlist submission:', JSON.stringify(body, null, 2));
    
    const data = WaitlistSchema.parse(body);
    console.log('Validated data:', data);
    
    // Check if email already exists
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: data.email }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist.' },
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
    
    // Get position in waitlist
    const position = await prisma.waitlistEntry.count();
    
    // Send confirmation email
    const emailResult = await sendWaitlistConfirmationEmail({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      position,
      locale: data.locale
    });
    
    if (!emailResult.success) {
      console.error('Email sending failed, but user was added to waitlist:', emailResult.error);
      // Don't fail the request if email fails - user is already in the waitlist
    }
    
    return NextResponse.json({ 
      success: true, 
      position 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid form data. Please check your inputs.',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const total = await prisma.waitlistEntry.count();
    const recentSignups = await prisma.waitlistEntry.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
        }
      }
    });
    
    // Add some artificial scarcity
    const spotsRemaining = Math.max(0, 500 - total);
    
    return NextResponse.json({ 
      total, 
      recentSignups,
      spotsRemaining,
      limitReached: total >= 500
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json({ 
      total: 0, 
      recentSignups: 0,
      spotsRemaining: 500,
      limitReached: false
    });
  }
}
