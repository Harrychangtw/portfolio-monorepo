// hooks/use-now-playing.ts
import { useEffect, useState } from 'react';
import type { NowPlaying } from '@portfolio/lib/lib/spotify';

type UseNowPlayingOptions = {
    fresh?: boolean;
};

export function useNowPlaying(pollIntervalMs = 20000, opts?: UseNowPlayingOptions) {
    const fresh = Boolean(opts?.fresh);
    const [data, setData] = useState<NowPlaying | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let canceled = false;
        let timer: number | undefined;
        let controller: AbortController | null = null;

        const load = async () => {
            controller?.abort();
            controller = new AbortController();
            try {
                const url = fresh
                    ? '/api/spotify/now-playing?fresh=1'
                    : '/api/spotify/now-playing';
                const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
                const json = await res.json();
                if (!canceled) setData(json);
            } catch (err: any) {
                if (!canceled && err?.name !== 'AbortError') {
                    setData({ isPlaying: false });
                }
            } finally {
                if (!canceled) setIsLoading(false);
            }
        };

        load();
        timer = window.setInterval(load, pollIntervalMs);

        return () => {
            canceled = true;
            if (timer) window.clearInterval(timer);
            controller?.abort();
        };
    }, [pollIntervalMs, fresh]);

    return { data, isLoading };
}
