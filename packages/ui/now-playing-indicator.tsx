// components/now-playing-indicator.tsx
'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function NowPlayingIndicator({ isPlaying }: { isPlaying?: boolean }) {
    return (
        <span className="relative inline-flex items-center h-4 w-0 ml-1">
            {isPlaying && (
                <span className="pointer-events-none">
                    <motion.span
                        className="absolute -top-3 -right-1 text-xs"
                        initial={{ opacity: 0, y: 6, rotate: -10 }}
                        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0 }}
                        style={{ color: 'hsl(var(--accent))' }}
                    >
                        ♪
                    </motion.span>
                    <motion.span
                        className="absolute -top-1 -right-3 text-[10px]"
                        initial={{ opacity: 0, y: 6, rotate: 5 }}
                        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                        style={{ color: 'hsl(var(--accent))' }}
                    >
                        ♫
                    </motion.span>
                    <motion.span
                        className="absolute -top-4 right-0 text-[11px]"
                        initial={{ opacity: 0, y: 6, rotate: -5 }}
                        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                        style={{ color: 'hsl(var(--accent))' }}
                    >
                        ♪
                    </motion.span>
                </span>
            )}
        </span>
    );
}

