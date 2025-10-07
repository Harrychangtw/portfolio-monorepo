// components/now-playing-indicator.tsx
'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function NowPlayingIndicator({ isPlaying }: { isPlaying?: boolean }) {
    return (
        <span className="relative inline-flex items-center">
            {/* Spotify glyph */}
            <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="w-4 h-4"
                style={{ color: '#1DB954' }}
            >
                <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm4.48 14.37a.75.75 0 0 1-1.03.24 8.2 8.2 0 0 0-8.9 0 .75.75 0 1 1-.79-1.27 9.7 9.7 0 0 1 10.48 0 .75.75 0 0 1 .24 1.03zm1.38-3.03a.9.9 0 0 1-1.24.29 10.7 10.7 0 0 0-11.25 0 .9.9 0 1 1-.95-1.53 12.5 12.5 0 0 1 13.15 0 .9.9 0 0 1 .29 1.24zm.1-3.17a1.05 1.05 0 0 1-1.44.34 13.9 13.9 0 0 0-14.64 0 1.05 1.05 0 1 1-1.1-1.78 16 16 0 0 1 16.84 0c.5.3.66.96.34 1.44z"
                />
            </svg>

            {isPlaying && (
                <span className="pointer-events-none">
                    <motion.span
                        className="absolute -top-3 -right-1 text-xs"
                        initial={{ opacity: 0, y: 6, rotate: -10 }}
                        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0 }}
                    >
                        ♪
                    </motion.span>
                    <motion.span
                        className="absolute -top-1 -right-3 text-[10px]"
                        initial={{ opacity: 0, y: 6, rotate: 5 }}
                        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                    >
                        ♫
                    </motion.span>
                    <motion.span
                        className="absolute -top-4 right-0 text-[11px]"
                        initial={{ opacity: 0, y: 6, rotate: -5 }}
                        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                    >
                        ♪
                    </motion.span>
                </span>
            )}
        </span>
    );
}
