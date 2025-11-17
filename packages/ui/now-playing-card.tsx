// components/now-playing-card.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { NowPlaying } from '@portfolio/lib/lib/spotify';
import Image from 'next/image';

function msToTime(ms?: number) {
    if (ms === undefined) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function NowPlayingCard({ data }: { data: NowPlaying }) {
    const [animatedProgress, setAnimatedProgress] = useState(data.progressMs);

    useEffect(() => {
        setAnimatedProgress(data.progressMs);

        const interval = setInterval(() => {
            setAnimatedProgress((prev) => {
                if (prev === undefined || data.durationMs === undefined) return undefined;
                return Math.min(prev + 1000, data.durationMs);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [data.progressMs, data.durationMs]);

    const progressPercentage =
        data.durationMs && animatedProgress
            ? Math.min(100, (animatedProgress / data.durationMs) * 100)
            : 0;

    return (
        <div className="w-[320px] max-w-[90vw] rounded-lg bg-[#1a1a1a] text-primary shadow-2xl border border-border p-3 font-ibm-plex">
            <div className="flex items-center gap-3">
                {data.albumImageUrl ? (
                    <Image
                        src={data.albumImageUrl}
                        alt={data.album ?? 'Album Cover'}
                        className="w-12 h-12 object-cover"
                        width={48}
                        height={48}
                    />
                ) : (
                    <div className="w-12 h-12 bg-secondary" />
                )}

                <div className="min-w-0 flex-grow">
                    <a
                        href={data.songUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-medium truncate hover:underline"
                        title={data.title}
                    >
                        {data.title ?? 'Unknown Track'}
                    </a>
                    <div className="text-sm text-secondary truncate" title={data.artist ?? 'Unknown Artist'}>
                        {data.artist ?? 'Unknown Artist'}
                    </div>
                </div>
            </div>

            {data.durationMs !== undefined && (
                <div className="mt-3">
                    <div className="h-1 bg-secondary rounded-full">
                        <div
                            className="h-1 bg-[hsl(var(--accent))] rounded-full"
                            style={{ 
                                width: `${progressPercentage}%`,
                                transition: 'width 1s ease-in-out'
                            }}
                        />
                    </div>
                    <div className="mt-1.5 text-[11px] text-secondary flex justify-between">
                        <span>{msToTime(animatedProgress)}</span>
                        <span>{msToTime(data.durationMs)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
