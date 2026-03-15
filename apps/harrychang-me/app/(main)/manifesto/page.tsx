"use client";
import { useState, useEffect, useRef, useMemo} from 'react';
import LetterGlitch from '@/components/main/letter-glitch';
import { useLanguage } from '@portfolio/lib/contexts/language-context';
import LanguageSwitcher from '@portfolio/ui/language-switcher';


const manifestoChunksEn = [
    [
        "I am the child who dismantled locks",
        "not to break them, but to hear",
        "the click of each tumbler falling into place—",
        "the small sound a secret makes",
        "when it decides to open."
    ],
    [
        "I seek no blueprint but the one I draft at dawn,",
        "no validation but the hum of a thing that works,",
        "no certainty but this:",
        "the silence of something unbuilt",
        "is the only silence I fear."
    ],
    [
        "I cannot claim indifference to being seen—",
        "every frame composed is a hand extended outward.",
        "But deeper than the reach lives the boy",
        "who pressed his ear to a stamping press in Shanghai,",
        "cheek warm against steel,",
        "convinced the rhythm was about to resolve into language.",
        "He did not know he was building a debt",
        "I would spend my life repaying."
    ],
    [
        "I am haunted by the hours between things.",
        "A speech in the morning. Surgery by afternoon.",
        "The distance between those two facts",
        "still measures how I spend my time.",
        "Yet the boy in the factory yard never counted.",
        "He only listened. He only stayed.",
        "Perhaps urgency is not the same as attention."
    ],
    [
        "I did not raise myself.",
        "Hands steadier than mine",
        "saw in dismantled locks not destruction but discovery,",
        "let the parts scatter across the kitchen table,",
        "and trusted I would learn",
        "what goes back where."
    ],
    [
        "Knowledge is not my crown but my compass—",
        "each model trained, each frame cut,",
        "each argument lost and studied afterward,",
        "returns me to the same question",
        "the boy asked the machine:",
        "what are you trying to say?"
    ],
    [
        "I refuse to let fluency become impatience,",
        "to let my speed become another's measure.",
        "Yet I confess: I still mistake silence for slowness,",
        "still forget that the child who read machines",
        "once stood for an hour",
        "hearing nothing,",
        "and called it listening."
    ],
    [
        "I still build fortresses for my ideas,",
        "still chase the flawless frame, the airtight argument,",
        "still perform competence in rooms that do not ask for it.",
        "I mistake being correct for being true.",
        "I mistake being published for being understood.",
        "The boy learned more from a broken lock",
        "than a finished one.",
        "I keep forgetting that."
    ],
    [
        "This path is often quiet.",
        "My focus, mistaken for distance.",
        "My silence, mistaken for indifference.",
        "I must learn to leave the door open—",
        "not just for the next project,",
        "but for the hands that might help me build."
    ],
    [
        "At sixteen, in a room at 3am,",
        "machines did the breathing I could not.",
        "I had given a speech that morning.",
        "By afternoon, my lungs had folded shut.",
        "No philosophy prepared me for that arithmetic.",
        "But the hours taught me:",
        "presence is not guaranteed,",
        "and so it cannot be deferred."
    ],
    [
        "I am my own audience, my own critic, my own first draft.",
        "Part freedom, part fortress—",
        "the freedom to fail without witnesses,",
        "the freedom to build without permission,",
        "and the cost of a gallery",
        "where I am sometimes the only guest."
    ],
    [
        "Every line of code I write,",
        "every frame I cut,",
        "every sentence I revise past midnight,",
        "is a conversation with the child",
        "who never asked, is this useful—",
        "only, what worlds can this build."
    ],
    [
        "I pledge to remain unfinished.",
        "Forever clumsy in some new language,",
        "forever the slowest hand in an unfamiliar room.",
        "To grant myself the grace",
        "I am still learning to give others—",
        "not because the harder road is better,",
        "but because this one is mine to cut."
    ],
    [
        "Yes, I am building a résumé.",
        "Yet, I am also building a bridge back to the factory yard—",
        "one I need more than any publication,",
        "more than any score.",
        "A bridge someone else might cross",
        "to find their own machine,",
        "still humming, still waiting to finish its sentence."
    ],
    [
        "I am both the question and the quest,",
        "both the mechanism and the hand that turns it.",
        "Forever the child with his ear against the steel,",
        "listening for what the machine almost said—",
        "hands dirty with building,",
        "heart still open enough",
        "to hear it when it does."
    ]
]

const manifestoChunksZhTw = [
    [
        "我是那個拆解門鎖的孩子，",
        "不為破壞，只為傾聽",
        "鎖簧逐一歸位的清脆",
        "那是秘密決意綻放時，",
        "最細微的聲響。"
    ],
    [
        "不求藍圖，只跟循黎明時親手繪就的草稿；", 
        "不求認可，只傾聽齒輪咬合時運轉的低鳴；", 
        "不求確信，只篤信這唯一的真理：",
        "尚未被造之物的沉默",
        "是我唯一畏懼的沉默。"
    ],
    [
        "我無法假裝不渴望被看見——",
        "每一幀構圖，都是一隻向外伸出的手。",
        "但比渴望更深處，住著那個男孩",
        "他將耳朵貼在上海的沖壓機上，",
        "稚嫩的臉頰感受著鋼鐵的餘溫，",
        "深信那無規律的節奏，即將化作言語。",
        "他並不知道，自己正築起一筆債，",
        "讓我用一生來償。"
    ],
    [
        "我時常被事物之間的縫隙縈繞。",
        "早晨的演說。午後的手術。", 
        "這兩段事之間的距離，",
        "至今仍丈量著我度過時間的尺度。",
        "然而，工廠裡的男孩從不計時。",
        "他只傾聽。他只停留。",
        "或許急迫，從不等於專注。"
    ],
    [
        "我並非憑空成長。",
        "是那些比我更沉穩的雙手，",
        "在散落的鎖件中，看見的不是破壞而是探索；",
        "由零件散落廚房桌面，",
        "並深信我終會學懂，",
        "如何將一切歸位。"
    ],
    [
        "知識不是我的桂冠，而是我的羅盤——",
        "訓練的每一個模型，剪輯的每一格畫面，", 
        "每一場輸了又反覆推敲的辯論，",
        "都引我回到同一個問題，",
        "那個男孩曾問向機器的問題：",
        "「你，究竟想說什麼？」"
    ],
    [
        "我拒絕讓熟練淪為不耐，", 
        "拒絕讓自己的速度，成為衡量他人的標尺。",
        "但我承認：我仍會將沉默誤認為遲緩，",
        "仍會忘記那個試圖聽懂機器的孩子，",
        "曾獨自站立一整個小時，",
        "什麼都沒聽見，",
        "卻稱之為，傾聽。"
    ],
    [
        "我仍會為自己的思緒砌起高牆，",
        "仍會追逐無瑕的畫面與滴水不漏的論點，",
        "仍會在不求表現的場合裡，賣弄著精通。",
        "我錯把「正確」當作「真實」。",
        "我錯把「發表」當作「理解」。",
        "那個男孩從損壞的門鎖中學到的，",
        "遠比完好的更多。",
        "而我，卻總是一再忘記。"
    ],
    [
        "我所行的這條路，時常悄然無聲。",
        "我的專注，被誤解為疏離。", 
        "我的沉默，被錯認為冷漠。",
        "我必須學會為這扇門留一道縫隙——",
        "不只為了下一個計畫，",
        "也為了那些願意一同砌築的手。"
    ],
    [
        "十六歲，凌晨三點的病房裡，",
        "機器替我完成我所無法的呼吸。",
        "那個早晨，我還在台上演說；",
        "到了午後，我的肺葉卻已摺疊閉鎖。",
        "沒有哲學能教我面對這道題目，",
        "但那些時刻教會了我：",
        "存在並非理所當然，",
        "所以不容推遲。"
    ],
    [
        "我是自己的觀眾、自己的樂評、自己的初稿。",
        "半是自由，半是牢籠——",
        "是那得以在無人目睹下失敗的自由，", 
        "是那得以在無須許可下建造的自由，",
        "以及是那座空曠展廳的代價：",
        "在這裡，我時常是唯一的訪客。"
    ],
    [
        "我寫下的每一行程式碼，", 
        "剪裁的每一格畫面，",
        "在午夜後反覆修改的每一個句子，",
        "都是與那個孩子的對話——",
        "他從不問：這有用嗎？",
        "他只問：這能建造怎樣的世界？"
    ],
    [
        "我誓願永遠保持未完成的姿態。",
        "永遠在某種新語言裡無比笨拙，", 
        "永遠是陌生房間裡，最慢的那雙手。",
        "去給予自己一份寬容，",
        "一份我仍在學習如何給予他人的寬容——", 
        "不是因為崎嶇的路更為高尚，",
        "而是因為這條路，由我親手開鑿。"
    ],
    [
        "是的，我在打造履歷。",
        "但我也在建造一座橋，通回那座工廠——",
        "比任何發表更需要的橋，",
        "比任何分數更需要的橋。",
        "一座他人或許也能走過的橋，",
        "去找到他們自己的那台機器。",
        "仍在低鳴，仍在等待，",
        "說完它未竟的那句話。",
    ],
    [
        "我既是提問，也是追尋；", 
        "既是齒輪的機關，也是轉動它的手。",
        "永遠是那個耳朵貼著鋼鐵的孩子，",
        "傾聽著機器幾乎說出的秘密——",
        "雙手沾滿砌築的塵土，",
        "而心依然敞開，",
        "敞開到足以在它終於開口時，聽見"
    ]
];




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
        return () => {
            document.body.style.overflow = 'auto';
        };
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
        <div className="min-h-screen font-heading bg-background text-foreground transition-colors duration-500">
            <div className="h-screen relative">
                <LetterGlitch onAnimationComplete={handleAnimationComplete} />
            </div>
            
            <div className={`transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
                <div className="container min-h-screen py-24 md:py-32">
                    <article>
                        {manifestoChunks.map((chunk, chunkIndex) => {
                            const isActive = activeChunks[chunkIndex];
                            return (
                                <div
                                    key={chunkIndex}
                                    ref={(el) => { chunkRefs.current[chunkIndex] = el; }}
                                    data-index={chunkIndex}
                                    className={`
                                        grid grid-cols-12 gap-4 md:gap-6 py-10 md:py-14 border-t border-border
                                        transition-all duration-700 ease-in-out will-change-[opacity,filter]
                                        ${isActive 
                                            ? 'opacity-100 translate-y-0 scale-100' 
                                            : 'opacity-20 translate-y-2 scale-[0.94]'
                                        }
                                    `}
                                >
                                    {/* Stanza number */}
                                    <div className="col-span-1 hidden md:block">
                                        <span className="font-mono text-xs text-secondary">
                                            {String(chunkIndex + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    {/* Stanza text - Anchored to the center line */}
                                    <div className="col-span-12 md:col-start-7 md:col-span-6 space-y-4">
                                        {chunk.map((line, lineIndex) => (
                                            <p 
                                                key={`${chunkIndex}-${lineIndex}`} 
                                                className="md:text-xl text-foreground leading-relaxed"
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </article>
                    {/* Extra padding at bottom to allow last item to reach center */}
                    <div className="h-[10vh]" /> 
                </div>
            </div>
        </div>
    );
}