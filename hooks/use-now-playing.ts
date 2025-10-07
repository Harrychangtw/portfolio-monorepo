// hooks/use-now-playing.ts
import { useEffect, useState } from 'react';
import type { NowPlaying } from '@/lib/spotify';

export function useNowPlaying(pollIntervalMs = 20000) {
    const [data, setData] = useState<NowPlaying | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let canceled = false;
        let timer: number;

        const load = async () => {
            try {
                const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' });
                const json = await res.json();
                if (!canceled) setData(json);
            } catch {
                if (!canceled) setData({ isPlaying: false });
            } finally {
                if (!canceled) setIsLoading(false);
            }
        };

        load();
        timer = window.setInterval(load, pollIntervalMs);
        return () => {
            canceled = true;
            window.clearInterval(timer);
        };
    }, [pollIntervalMs]);

    return { data, isLoading };
}
