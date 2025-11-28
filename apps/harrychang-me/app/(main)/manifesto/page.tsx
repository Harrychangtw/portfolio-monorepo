"use client";
import { useState, useEffect, useRef } from 'react';
import LetterGlitch from '@portfolio/ui/letter-glitch';
import { useLanguage } from '@portfolio/lib/contexts//LanguageContext';
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
        "Eyes wide with wonder at machines that breathed and sang."
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
        "The boy who dismantled locks to understand their secrets",
        "Still lives in the very person who unlocks technology's mysteries."
    ],
    [
        "Yet, I confess, I still build fortresses for my ideas,",
        "Still pursuit the flawless algorithm, the perfect frame.",
        "I mistake being \"correct\" for being \"true\",",
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
        "Forever learning, forever teaching,",
        "Forever taking the road less traveled—",
        "Not because it's harder,",
        "But because it's mine to make."
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
        "有人說，燃燒得加倍明亮的火焰，持續的時間也只有一半",
        "而我，選擇光芒"
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
        "那個拆解門鎖，只為理解其中奧義的男孩",
        "依然活在今日，這個解開科技之謎的青年心中"
    ],
     [
        "然而，我仍為思緒砌起堡壘",
        "仍追逐分毫不差的程式，天衣無縫的畫面",
        "錯把「正確」當作「真誠」",
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
        "永遠在學習，永遠在傳承",
        "永遠走那條人跡罕至的路",
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

export default function ManifestoPage() {
    const { language } = useLanguage();
    const [introComplete, setIntroComplete] = useState(false);
    
    // Get the appropriate manifesto chunks based on language
    const manifestoChunks = language === 'zh-TW' ? manifestoChunksZhTw : manifestoChunksEn;
    
    const [visibleChunks, setVisibleChunks] = useState<boolean[]>(
        new Array(manifestoChunks.length).fill(false)
    );
    const chunkRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleAnimationComplete = () => {
        setTimeout(() => setIntroComplete(true), 500);
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Block scrolling until the intro animation is complete
    useEffect(() => {
        if (!introComplete) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [introComplete]);

    
    useEffect(() => {
        setVisibleChunks(new Array(manifestoChunks.length).fill(false));
    }, [language, manifestoChunks.length]);

    // Set up IntersectionObserver to reveal chunks on scroll
    useEffect(() => {
        if (!introComplete) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                        setVisibleChunks((prev) => {
                            const newVisible = [...prev];
                            newVisible[index] = true;
                            return newVisible;
                        });
                        // Stop observing the element once it's visible
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '0px',
                threshold: 0.2 // Trigger when 20% of the chunk is visible
            }
        );

        chunkRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        // Cleanup observer on component unmount
        return () => observer.disconnect();

    }, [introComplete, language]);

    return (
        <div className="min-h-screen font-mono bg-background text-gray-300">
            {/* Header section with glitch effect */}
            <div className="h-screen relative">
                <LetterGlitch 
                    onAnimationComplete={handleAnimationComplete}
                />
            </div>
            
            {/* Content section, revealed after the intro */}
            <div className={`transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
                <div className="container min-h-screen py-24">
                    <div className="max-w-4xl mx-auto">
                        <article className="space-y-24 bg-background/50 backdrop-blur-sm p-8 md:p-12 rounded-lg">
                            {manifestoChunks.map((chunk, chunkIndex) => (
                                <div
                                    key={chunkIndex}
                                    ref={(el) => {
                                        chunkRefs.current[chunkIndex] = el;
                                    }}
                                    data-index={chunkIndex}
                                    className="space-y-4"
                                >
                                    {chunk.map((line, lineIndex) => (
                                        <div 
                                            key={`${chunkIndex}-${lineIndex}`} 
                                            className={`block transition-all duration-1000 ease-out ${
                                                visibleChunks[chunkIndex] 
                                                    ? 'opacity-100 translate-y-0' 
                                                    : 'opacity-0 translate-y-8'
                                            }`}
                                            style={{
                                                transitionDelay: visibleChunks[chunkIndex] ? `${lineIndex * 200}ms` : '0ms'
                                            }}
                                        >
                                            <p className="text-base md:text-lg leading-relaxed text-gray-200">
                                                {line}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
}
