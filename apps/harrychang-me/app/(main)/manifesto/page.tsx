"use client";
import { useState, useEffect, useRef, useMemo} from 'react';
import LetterGlitch from '@/components/main/letter-glitch';
import { useLanguage } from '@portfolio/lib/contexts/language-context';
import LanguageSwitcher from '@portfolio/ui/language-switcher';

const manifestoChunksEn = [
    [
        "I am the child who saw marvels in LEGO bricks,",
        "Not for their colors, but for the latent architecture within—",
        "Each joint a prayer to possibility,",
        "Each mechanism a meditation on what could be."
    ],
    [
        "I seek no gods beyond the wonders I craft with my bare hands",
        "No blueprint but the code I write at dawn,",
        "No heaven but the moment when an idea takes flight,",
        "No hell but the silence of unexpressed potential."
    ],
    [
        "I live not for applause or accolades,",
        "But for the five-year-old who rode uncertain bicycles",
        "Through Shanghai factory yards,",
        "Eyes wide with wonder at machines that breathed and sang.",
        "He did not know he was building a debt I would spend my life repaying."
    ],
    [
        "I am haunted by the weight of wasted seconds,",
        "Convinced that youth's potential bleeds through idle fingers—",
        "Every aimless scroll a quiet betrayal,",
        "Every unmeasured pause a door swinging shut.",
        "Yet the boy in the factory yard never watched the clock.",
        "He only watched. He only wondered.",
        "Perhaps becoming need not be weighed by the minute."
    ],
    [
        "While I honor the child I once was,",
        "This is not a self-centered reverence—",
        "I am profoundly grateful for the family that nurtured that child,",
        "Who saw in dismantled locks not destruction but discovery,",
        "Who understood that wonder needs both freedom and foundation."
    ],
    [
        "Knowledge is not my crown but my compass—",
        "Each algorithm learned, each frame edited,",
        "Each robot programmed, each story told,",
        `Returns me to that first question: "Where can this be used?"`
    ],
    [
        "I refuse to let expertise become arrogance,",
        "To let achievement build walls where curiosity built bridges.",
        "Yet I confess: I still grow impatient with unfamiliarity,",
        "Still mistake another's slowness for insufficiency—",
        "Forgetting the boy who dismantled locks",
        "Was once the clumsiest hand, the most confused mind,",
        "And the world was patient with him."
    ],
    [
        "Yet I confess, I still build fortresses for my ideas,",
        "Still chase the flawless algorithm, the perfect frame,",
        "Still perform mastery on stages I find hollow.",
        "I mistake being \"correct\" for being \"true,\"",
        "I mistake being \"published\" for being \"understood,\"",
        "And forget the boy who learned more from a broken lock",
        "Than a finished one."
    ],
    [
        "This path I forge is often a solitary one;",
        "My focus, a wall mistaken for a fortress;",
        "My silence, a stillness mistaken for scorn;",
        "I must learn to open the gate not just for the next project;",
        "But for the hands that might help me build."
    ],
    [
        "When breath came hard in hospital beds,",
        "When lungs collapsed like faulty code,",
        "I learned that existence precedes essence—",
        "That we are not defined by our limitations but by our response to them.",
        "For the light that burns twice as bright burns half as long,",
        "and I have always chosen to burn brightly."
    ],
    [
        "I am my own audience, my own critic, my own muse.",
        "Not from narcissism, but from freedom—",
        "The freedom to fail magnificently,",
        "The freedom to explore without permission,",
        "The freedom to share without expectation."
    ],
    [
        "Every line of code I write,",
        "Every frame I cut,",
        "Every speech I give,",
        "Is a conversation with that child who asked not \"Is this useful?\"",
        "But \"What worlds can this create?\""
    ],
    [
        "I pledge to remain forever unfinished,",
        "Forever clumsy in some new tongue,",
        "Forever the slowest hand in an unfamiliar room—",
        "And to grant myself the grace",
        "I am still learning to give others.",
        "Not because the road is harder,",
        "But because it is mine to make."
    ],
    [
        "For I am not building a resume or a reputation.",
        "I am building a bridge back to wonder,",
        "A bridge others might cross",
        "To find their own five-year-old selves",
        "Waiting patiently in the machinery of dreams."
    ],
    [
        "In this existence I choose to create,",
        "I am both the question and the quest,",
        "Both the builder and the built,",
        "Forever becoming,",
        "Forever beginning,",
        "Forever that child in the factory yard,",
        "Looking up at the infinite.",
        "Hands dirty with creation, heart crystal with marvels.",
    ],
];

const manifestoChunksZhTw = [
    [
        "我是那個孩子，在樂高積木裡，看見了奇蹟",
        "不為斑斕色彩，只為其中精妙的設計",
        "每一處接榫，皆是涓滴成河之始",
        "每一具齒輪，盡是鑑往知來之思"
    ],
    [
        "我不追尋神祇，只求親手打造的驚奇",
        "我不追索藍圖，除非那是我黎明寫下的程式碼",
        "巔峰，是思想展翅高飛的瞬間",
        "深淵，是潛能身陷囹圄的死寂"
    ],
    [
        "我活著，不為掌聲或喝采",
        "而是為了那個五歲的自己",
        "騎著搖晃的單車，穿梭在上海的工廠",
        "對著那些會呼吸、會歌唱的機器，滿眼驚奇",
        "他不知道，他正在築一筆債，讓我用一生償還"
    ],
    [
        "我被虛度的光陰纏繞",
        "深信年少的潛能，正悄然流逝——",
        "流逝於每一次漫無目的的滑動",
        "流逝於每一刻未經計算的空轉",
        "然而工廠裡的孩子，從不看錶",
        "他只是看著，只是驚嘆",
        "或許，成為不必時刻以產出衡量"
    ],
    [
        "我遙想那個孩子，卻非出於自私",
        "我深深感謝，那個開明的家庭",
        "在被拆解的鎖裡，他們看到的不是破壞，而是探索",
        "他們明白，成長需要自由，也需要根基"
    ],
    [
        "知識不是我的桂冠，而是羅盤",
        "學習的每道演算法，剪輯的每幀影像",
        "開發的每個機器人，訴說的每個故事",
        "都引我回到最初的提問：「它，能用在何方？」"
    ],
    [
        "我拒絕讓專業變成傲慢",
        "拒絕讓成就築起高牆，隔絕了曾用好奇心搭建的橋樑",
        "然而我仍承認：我對陌生仍缺乏耐心",
        "仍將他人的緩慢，視作不足——",
        "卻忘了那個拆解門鎖的男孩",
        "曾是最笨拙的手，最困惑的心",
        "而世界，曾對他溫柔以待"
    ],
    [
        "然而，我仍為思緒砌起堡壘",
        "仍追逐分毫不差的程式，天衣無縫的畫面",
        "仍在空洞的舞台上，扮演著精通",
        "錯把「正確」當作「真誠」",
        "錯把「發表」當作「被理解」",
        "卻忘了那個男孩，從壞損的鎖中",
        "學到的遠比完整的更多"
    ],
    [
        "我開闢的這條路，也常是孤途",
        "我的專注，被誤解為高牆",
        "我的沉默，被錯認為冷漠",
        "我必須學會敞開大門，不只為了下個計畫",
        "更為了那，願意一同砌築的雙手"
    ],
    [
        "當呼吸在病床上變得艱難",
        "當肺泡如壞損的程式碼般崩塌",
        "我學會了：存在先於本質",
        "定義我們的，從非我們的極限",
        "而是我們如何回應極限"
    ],
    [
        "我是自己的觀眾，自己的評審，自己的繆思",
        "這並非自負，而是源於自由",
        "一種得以華麗失敗的自由",
        "一種無須許可便能探索的自由",
        "一種不求回報就能分享的自由"
    ],
    [
        "我寫下的每一行程式碼",
        "剪下的每一格影片",
        "發表的每一次演說",
        "都是與那個孩子的對話",
        "他問的不是「這有用嗎？」",
        "而是「這能創造怎樣的世界？」"
    ],
    [
        "我誓願永遠保持未完成",
        "永遠在某種新語言裡笨拙",
        "永遠是陌生房間裡，最慢的那雙手——",
        "並學會給予自己",
        "我仍在學習給予他人的寬容",
        "不因其艱難",
        "只因那條路，由我親手開創"
    ],
    [
        "因為我建造的，不是履歷或名聲",
        "我建造的，是一座橋，回到最初的童貞",
        "一座讓他人也能走過的橋",
        "去尋找他們自己心中那個五歲的靈魂",
        "在夢想的機械回眸中，耐心等候"
    ],
    [
        "在這我選擇創造的實存中",
        "我既是提問，也是追尋",
        "既是建造者，也是被造物",
        "永遠在演化",
        "永遠在初始",
        "永遠是那個工廠裡的孩子",
        "雙手滿是創造的塵土",
        "指尖輕觸無垠，內心澄澈如初。"

    ]
];


// ... (Keep your manifestoChunksEn and manifestoChunksZhTw arrays here) ...

export default function ManifestoPage() {
    const { language } = useLanguage();
    const [introComplete, setIntroComplete] = useState(false);
    
    // Memoize chunks to prevent unnecessary recalculations
    const manifestoChunks = useMemo(() => {
        return language === 'zh-TW' ? manifestoChunksZhTw : manifestoChunksEn;
    }, [language]);

    const [activeChunks, setActiveChunks] = useState<boolean[]>(
        new Array(manifestoChunks.length).fill(false)
    );
    
    const chunkRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleAnimationComplete = () => {
        setTimeout(() => setIntroComplete(true), 500);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        document.body.style.overflow = introComplete ? 'auto' : 'hidden';
    }, [introComplete]);

    // Reset state on language change
    useEffect(() => {
        setActiveChunks(new Array(manifestoChunks.length).fill(false));
    }, [manifestoChunks.length]);

    // The Spotlight Logic
    useEffect(() => {
        if (!introComplete) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                    
                    // Toggle active state based on intersection
                    setActiveChunks((prev) => {
                        // Performance optimization: prevent state update if value hasn't changed
                        if (prev[index] === entry.isIntersecting) return prev;
                        
                        const newActive = [...prev];
                        newActive[index] = entry.isIntersecting;
                        return newActive;
                    });
                });
            },
            {
                // Root margin creates the "Spotlight" area.
                // Negative margins shrink the detection area to the center of the screen.
                // -30% means top 30% and bottom 30% of screen are "inactive zones".
                rootMargin: '-30% 0px -30% 0px',
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
    }, [introComplete, manifestoChunks.length]);

    return (
        <div className="min-h-screen font-mono bg-background text-gray-300">
            <div className="h-screen relative">
                <LetterGlitch onAnimationComplete={handleAnimationComplete} />
            </div>
            
            <div className={`transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
                <div className="container min-h-screen py-24 md:py-24">
                    <div className="max-w-4xl mx-auto">
                        <article className="space-y-20 md:space-y-20 px-4 md:px-12">
                            {manifestoChunks.map((chunk, chunkIndex) => {
                                const isActive = activeChunks[chunkIndex];
                                return (
                                    <div
                                        key={chunkIndex}
                                        ref={(el) => { chunkRefs.current[chunkIndex] = el; }}
                                        data-index={chunkIndex}
                                        className={`
                                            space-y-4 transition-all duration-700 ease-in-out will-change-[opacity,filter]
                                            ${isActive 
                                                ? 'opacity-100 translate-y-0 scale-100' 
                                                : 'opacity-20 translate-y-2 scale-[0.98]'
                                            }
                                        `}
                                    >
                                        {chunk.map((line, lineIndex) => (
                                            <p 
                                                key={`${chunkIndex}-${lineIndex}`} 
                                                className="text-base md:text-lg leading-relaxed text-gray-200"
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                );
                            })}
                        </article>
                        {/* Extra padding at bottom to allow last item to reach center */}
                        <div className="h-[10vh]" /> 
                    </div>
                </div>
            </div>
        </div>
    );
}