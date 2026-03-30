import { NextResponse } from "next/server";

// --- Rate Limiting Configuration ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5; // Limit to 3 requests per minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup expired entries every 5 minutes

// In-memory store for rate limiting
// Note: In a serverless environment (Vercel), this map persists only as long as the
// lambda container is warm. This is sufficient to block high-frequency spam scripts.
// For distributed persistence, you would need Redis or a Database table.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();
let lastCleanup = Date.now();

// Helper: Get Client IP robustly
function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can be a list, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
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

export async function POST(req: Request) {
  try {
    // 1. IP Extraction & Rate Limiting
    const ip = getClientIp(req);
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
      console.warn(`[Guestbook] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    // Increment request count
    rateData.count++;
    rateLimitMap.set(ip, rateData);

    // 2. Request Validation
    const body = await req.json();
    const { message } = body;

    // Check for existence, type, and non-empty content (prevent "   " spam)
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (message.length > 100) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // 3. Webhook Dispatch
    const webhookUrl = process.env.DISCORD_GUESTBOOK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("DISCORD_GUESTBOOK_WEBHOOK_URL is not defined");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    const sanitizedMessage = message.replace(/@/g, "@\u200b"); // Inserts a zero-width space to break the tag

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**New Guestbook Entry**\n> ${sanitizedMessage}`,
        username: "Guestbook Bot",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guestbook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
