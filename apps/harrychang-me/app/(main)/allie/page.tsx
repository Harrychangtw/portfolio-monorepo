"use client";
import { useState, useEffect, useRef } from 'react';

const letterChunks = [
    [
        "哈囉李翊禎姐姐："
    ],
    [
        "我們去年的前幾天還在桃園聽演唱會呢，今年就變成 18 歲哩，真的是時間好快。如果妳十八歲的話，你現在就是戀童癖誒逮逮，抓一個大的。接下來 12 天辛苦了，但學測過後就開開心心囉！今天我除了想感謝你以外，也想要好好的祝福你！咕嚕"
    ],
    [
        "我想先感謝你出現在我的生命當中。除了在之前陪伴我以外，我們的個性也是嘎嘎噠。從前年帶給我姑姑嚕嚕，還有每一天每個小時聽我在那裡逼逼巴巴，謝謝你都願意忍受一個跟幼兒園沒兩樣的底迪在你身邊跑來跑去，鑽來鑽去。也很謝謝你無比的相信我，甚至比我自己還更深信我的能力，讓我有勇氣面對種種未知。我更謝謝你當一個善良的人，從來不對我以及其他人太兇，我真的真的愛你呦哭哭，咕嚕。"
    ],
    [
        "接著我想跟你說聲對不起。我最近其實都很害怕我的出席是一種壓力來源。我不知道我在你身邊的存在，是一種壓力還是動力，而我願答案是後者。除此以外，也很對不起很常會做一下傻事，笨得跟什麼幼稚園小孩一樣。"
    ],
    [
        "最後，我真的想要好好的祝福你。雖然現在可能沒有辦法慶祝一個大的，但我覺對相信在 2/25 等著妳的是一片海闊天空。你是絕對有能力可以去到你想要去的地方的，不論今天、明天還是未來的任何一天。皇天不負有心人，不論你相不相信自己，我還有你身邊的很多人，一定都不曾懷疑過妳，只希望你不要唱衰自己呦。所以，真心祝福的未來一切，也祝福你能找到那份相信自己一直擁有的那份實力的勇氣及自信！"
    ],
    [
        "買個我趴嚕謝謝（我ㄅㄧㄠˋ"
    ],
    [
        "張咕嚕敬上"
    ]
];

export default function AllieBirthdayPage() {
    const [mounted, setMounted] = useState(false);
    const [activeChunks, setActiveChunks] = useState<boolean[]>(
        new Array(letterChunks.length).fill(false)
    );

    const chunkRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Small delay for smooth initial appearance
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // The Spotlight Logic
    useEffect(() => {
        if (!mounted) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);

                    setActiveChunks((prev) => {
                        if (prev[index] === entry.isIntersecting) return prev;

                        const newActive = [...prev];
                        newActive[index] = entry.isIntersecting;
                        return newActive;
                    });
                });
            },
            {
                // Spotlight area - negative margins create the focus zone
                rootMargin: '-25% 0px -25% 0px',
                threshold: 0
            }
        );

        const currentRefs = chunkRefs.current;
        currentRefs.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            currentRefs.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
            observer.disconnect();
        };
    }, [mounted]);

    return (
        <div className="min-h-screen bg-background">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            <div className={`relative transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div className="container min-h-screen py-16 md:py-24">
                    <div className="max-w-3xl mx-auto">
                        {/* Birthday header */}
                        <div className="text-center mb-16 md:mb-20 px-4">
                            <div className="inline-block mb-6">
                                <div className="text-5xl md:text-5xl animate-bounce">🎂</div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-heading mb-4">
                                Happy 18th Birthday!
                            </h1>
                        </div>

                        <article className="space-y-2 md:space-y-16 px-6 md:px-12">
                            {letterChunks.map((chunk, chunkIndex) => {
                                const isActive = activeChunks[chunkIndex];
                                const isFirst = chunkIndex === 0;
                                const isLast = chunkIndex === letterChunks.length - 1;

                                return (
                                    <div
                                        key={chunkIndex}
                                        ref={(el) => { chunkRefs.current[chunkIndex] = el; }}
                                        data-index={chunkIndex}
                                        className={`
                                            transition-all duration-700 ease-in-out will-change-[opacity,transform]
                                            ${isActive
                                                ? 'opacity-100 translate-y-0 scale-100'
                                                : 'opacity-30 translate-y-3 scale-[0.98]'
                                            }
                                            ${isFirst ? 'text-center' : ''}
                                            ${isLast ? 'text-right' : ''}
                                        `}
                                    >
                                        {chunk.map((line, lineIndex) => (
                                            <p
                                                key={`${chunkIndex}-${lineIndex}`}
                                                className={`
                                                    leading-relaxed
                                                    ${isFirst
                                                        ? 'text-xl md:text-lg font-semibold text-gray-800 dark:text-gray-100'
                                                        : isLast
                                                        ? 'text-base md:text-lg italic text-gray-700 dark:text-gray-200'
                                                        : 'text-base md:text-lg text-gray-700 dark:text-gray-200'
                                                    }
                                                `}
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                );
                            })}
                        </article>

                        {/* Bottom decoration */}
                        <div className="text-center mt-20 md:mt-32 mb-12 space-y-4">
                            <div className="flex justify-center gap-3 text-2xl md:text-3xl">
                                <span className="animate-bounce delay-0">✨</span>
                                <span className="animate-bounce delay-100">🍀</span>
                                <span className="animate-bounce delay-200">🎂</span>
                                <span className="animate-bounce delay-300">🦄</span>
                                <span className="animate-bounce delay-400">💫</span>
                                
                            </div>
                            <p className="text-sm md:text-base text-secondary font-heading">
                                2026.01.05
                            </p>
                        </div>

                        {/* Extra padding at bottom to allow last item to reach center */}
                        <div className="h-[15vh]" />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .animate-bounce {
                    animation: bounce 2s ease-in-out infinite;
                }

                .delay-0 { animation-delay: 0s; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-1000 { animation-delay: 1s; }
                .delay-2000 { animation-delay: 2s; }
            `}</style>
        </div>
    );
}
