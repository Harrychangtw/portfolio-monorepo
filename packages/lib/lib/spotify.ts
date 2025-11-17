// lib/spotify.ts
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';

export interface NowPlaying {
    isPlaying: boolean;
    title?: string;
    artist?: string;
    album?: string;
    albumImageUrl?: string;
    songUrl?: string;
    progressMs?: number;
    durationMs?: number;
}

function getEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

async function getAccessToken() {
    const clientId = getEnv('SPOTIFY_CLIENT_ID');
    const clientSecret = getEnv('SPOTIFY_CLIENT_SECRET');
    const refreshToken = getEnv('SPOTIFY_REFRESH_TOKEN');

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
        cache: 'no-store',
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Spotify token error: ${res.status} ${txt}`);
    }

    const data = await res.json();
    return data.access_token as string;
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
    const accessToken = await getAccessToken();

    const res = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
    });

    if (res.status === 204 || res.status === 202) {
        return null; // No content or not playing
    }
    if (!res.ok) {
        // Gracefully degrade
        return null;
    }

    const data = await res.json();

    if (!data || !data.item) {
        return null;
    }

    const isPlaying = data.is_playing;
    const title = data.item.name as string;
    const artist = (data.item.artists ?? []).map((a: any) => a.name).join(', ');
    const album = data.item.album?.name as string | undefined;
    const albumImageUrl = data.item.album?.images?.[0]?.url as string | undefined;
    const songUrl = data.item.external_urls?.spotify as string | undefined;
    const progressMs = data.progress_ms as number | undefined;
    const durationMs = data.item.duration_ms as number | undefined;

    return {
        isPlaying: Boolean(isPlaying),
        title,
        artist,
        album,
        albumImageUrl,
        songUrl,
        progressMs,
        durationMs,
    };
}
