// hooks/use-now-playing.ts
import { useEffect, useState } from "react";
import type { NowPlaying } from "@portfolio/lib/lib/spotify";

type UseNowPlayingOptions = {
  fresh?: boolean;
};

export function useNowPlaying(
  pollIntervalMs = 60000,
  opts?: UseNowPlayingOptions,
) {
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
          ? "/api/spotify/now-playing?fresh=1"
          : "/api/spotify/now-playing";
        const res = await fetch(url, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!canceled) setData(json);
      } catch (err: any) {
        if (!canceled && err?.name !== "AbortError") {
          setData({ isPlaying: false });
        }
      } finally {
        if (!canceled) setIsLoading(false);
      }
    };

    const startTimer = () => {
      if (timer !== undefined) return;
      timer = window.setInterval(load, pollIntervalMs);
    };
    const stopTimer = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        load();
        startTimer();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
      // Tabs opened in the background should not poll until focused.
      if (!document.hidden) {
        load();
        startTimer();
      }
    } else {
      load();
      startTimer();
    }

    return () => {
      canceled = true;
      stopTimer();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      controller?.abort();
    };
  }, [pollIntervalMs, fresh]);

  return { data, isLoading };
}
