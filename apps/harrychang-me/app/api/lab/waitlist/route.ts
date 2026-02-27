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

export async function GET() {
  try {
    const total = await prisma.waitlistEntry.count();
    
    return NextResponse.json({ total });
  } catch (error) {
    return NextResponse.json({ total: 0 });
  }
}

