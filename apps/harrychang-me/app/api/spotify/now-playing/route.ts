// app/api/spotify/now-playing/route.ts
import { NextResponse } from 'next/server';
import { getNowPlaying } from '@portfolio/lib/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fresh = searchParams.get('fresh') === '1';

        const np = await getNowPlaying();
        const payload = np ?? { isPlaying: false };

        const res = NextResponse.json(payload);

        if (fresh) {
            res.headers.set('Cache-Control', 'no-store');
        } else {
            res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        }

        return res;
    } catch {
        const res = NextResponse.json({ isPlaying: false });
        res.headers.set('Cache-Control', 'no-store');
        return res;
    }
}
