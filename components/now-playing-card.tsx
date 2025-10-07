// components/now-playing-card.tsx
'use client';

import React from 'react';
import type { NowPlaying } from '@/lib/spotify';

function msToTime(ms?: number) {
    if (!ms && ms !== 0) return '--:--';
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NowPlayingCard({ data }: { data: NowPlaying }) {
    const pct =
        data.durationMs && data.progressMs
            ? Math.min(100, Math.max(0, (data.progressMs / data.durationMs) * 100))
            : 0;

    return (
        <div className="w-[320px] max-w-[90vw] rounded-lg bg-white text-black shadow-lg border border-black/10 p-3">
            <div className="flex items-center gap-3">
                {data.albumImageUrl ? (
                    // If you use next/image, allow i.scdn.co in next.config.js
                    <img
                        src={data.albumImageUrl}
                        alt={data.album ?? 'Album'}
                        className="w-12 h-12 rounded object-cover"
                        width={48}
                        height={48}
                    />
                ) : (
                    <div className="w-12 h-12 rounded bg-gray-200" />
                )}

                <div className="min-w-0">
                    <a
                        href={data.songUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-medium truncate hover:underline"
                        title={data.title}
                    >
                        {data.title ?? 'Unknown track'}
                    </a>
                    <div className="text-sm text-black/70 truncate" title={`${data.artist ?? ''}${data.album ? ' • ' + data.album : ''}`}>
                        {data.artist ?? 'Unknown artist'}
                        {data.album ? ` • ${data.album}` : ''}
                    </div>
                </div>
            </div>

            {data.durationMs !== undefined && (
                <div className="mt-3">
                    <div className="h-1.5 bg-black/10 rounded">
                        <div
                            className="h-1.5 bg-[#1DB954] rounded"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="mt-1 text-[11px] text-black/70 flex justify-between">
                        <span>{msToTime(data.progressMs)}</span>
                        <span>{msToTime(data.durationMs)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
