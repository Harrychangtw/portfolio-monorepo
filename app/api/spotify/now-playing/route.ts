// app/api/spotify/now-playing/route.ts
import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const np = await getNowPlaying();
        const payload = np ?? { isPlaying: false };

        const res = NextResponse.json(payload);
        // Cache at the CDN for 10s; client can poll less frequently
        res.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
        return res;
    } catch {
        const res = NextResponse.json({ isPlaying: false });
        res.headers.set('Cache-Control', 'no-store');
        return res;
    }
}
