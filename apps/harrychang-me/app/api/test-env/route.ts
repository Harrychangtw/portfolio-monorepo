// apps/harrychang-me/app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // This runs exclusively on the server, so it's safe to access secrets.
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const spotifyRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  const databaseUrl = process.env.DATABASE_PRISMA_DATABASE_URL;

  return NextResponse.json({
    "SPOTIFY_CLIENT_ID": spotifyClientId || null,
    "SPOTIFY_CLIENT_SECRET": `Is set: ${!!spotifyClientSecret}`,
    "SPOTIFY_REFRESH_TOKEN": `Is set: ${!!spotifyRefreshToken}`,
    "DATABASE_PRISMA_DATABASE_URL": `Is set: ${!!databaseUrl}`,
  });
}
