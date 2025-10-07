// app/api/spotify/callback/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return new NextResponse(`Spotify auth error: ${error}`, { status: 400 });
    }
    if (!code) {
        return new NextResponse('Missing code', { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/spotify/callback';

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });

    const json = await tokenRes.json();
    // Copy this from your server logs safely, then remove this route
    console.log('SPOTIFY_REFRESH_TOKEN:', json.refresh_token);

    return new NextResponse(
        'Refresh token logged on server. Copy it from your terminal and set SPOTIFY_REFRESH_TOKEN. You can now remove this route.',
        { status: 200 }
    );
}
