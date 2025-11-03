</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(studio)/studio/page.tsx>
import { Suspense } from 'react';
import StudioPageClient from '@/components/studio/studio-page-client';

export const metadata = {
  title: 'Studio — Harry Chang',
  description: 'Exclusive courses and consulting on AI, development, and creative technology. Join the waitlist.',
};

/**
 * Main server component for the Studio landing page.
 * It uses Suspense to handle the client-side nature of the page content.
 */
export default function StudioPage() {
  return (
    <Suspense>
      <StudioPageClient />
    </Suspense>
  );
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(studio)/studio/page.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/letter-glitch.tsx>
"use client";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  smooth?: boolean;
  onAnimationComplete?: () => void;
  hasVignette?: boolean;
  centerVignette?: boolean;
  disableIntro?: boolean;
}

const LetterGlitch = ({
  glitchColors = ["#2b4539", "#D8F600", "#61b3dc"],
  glitchSpeed = 50,
  smooth = true,
  onAnimationComplete,
  hasVignette = false,
  centerVignette = false,
  disableIntro = false,
}: LetterGlitchProps) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<{
    char: string;
    color: string;
    targetColor: string;
    colorProgress: number;
    originalChar: string;
    isAnimating: boolean;
    isAsciiArt: boolean;
  }[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());
  
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [isWideEnough, setIsWideEnough] = useState(true);
  const minWidth = 800;
  
  // Refs to hold the latest state for the animation loop, preventing stale closures.
  const animationPhaseRef = useRef(animationPhase);
  animationPhaseRef.current = animationPhase;
  const scrollIntensityRef = useRef(0);

  const blinkRef = useRef(true);
  const lastBlinkTime = useRef(Date.now());
  const scrollIndicatorBlinkRef = useRef(true);
  const lastScrollIndicatorBlinkTime = useRef(Date.now());

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const asciiArt = [
    " _     _             __            _                          _ _ _        _     ",
    "| |   ( )           / _|          | |                        (_| ) |      (_)    ",
    "| |   |/  ___ _ __ | |_ __ _ _ __ | |_    __ _ _   _  ___     _|/| |_ __ _ _ ___ ",
    "| |      / _ \\ '_ \\|  _/ _` | '_ \\| __|  / _` | | | |/ _ \\   | | | __/ _` | / __|",
    "| |____ |  __/ | | | || (_| | | | | |_  | (_| | |_| |  __/   | | | || (_| | \\__ \\",
    "\\_____/  \\___|_| |_|_| \\__,_|_| |_|\\__|  \\__, |\\__,_|\\___|   | |  \\__\\__,_|_|___/",
    "                                            | |             _/ |                 ",
    "                                            |_|          |__/                "
  ];

  const lettersAndSymbols = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "!", "@", "#", "$", "&", "*", "(", ")", "-", "_", "+", "=", "/",
    "[", "]", "{", "}", ";", ":", "<", ">", ",", "0", "1", "2", "3",
    "4", "5", "6", "7", "8", "9"
  ];

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const interpolateColor = (color1: {r:number,g:number,b:number}, color2: {r:number,g:number,b:number}, factor: number) => {
    const r = Math.round(color1.r + factor * (color2.r - color1.r));
    const g = Math.round(color1.g + factor * (color2.g - color1.g));
    const b = Math.round(color1.b + factor * (color2.b - color1.b));
    return `rgb(${r},${g},${b})`;
  };

  const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  const getRandomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];
  const calculateGrid = (width: number, height: number) => ({
    columns: Math.ceil(width / charWidth),
    rows: Math.ceil(height / charHeight),
  });

  const getTextPosition = (text: string, columns: number, rows: number, offsetY = 0) => ({
    textRow: Math.floor(rows / 2) + offsetY,
    startCol: Math.floor((columns - text.length) / 2),
  });

  const getAsciiPosition = (columns: number, rows: number) => ({
    startRow: Math.floor((rows - asciiArt.length) / 2)
  });

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    letters.current = Array.from({ length: columns * rows }, () => ({
      char: " ", color: "#ffffff", targetColor: "#ffffff",
      colorProgress: 1, originalChar: " ", isAnimating: false, isAsciiArt: false
    }));
  };

  const clearText = (preserveAsciiArt = false) => {
    letters.current.forEach(letter => {
      if (preserveAsciiArt && letter.isAsciiArt) return;
      letter.char = " "; 
      letter.originalChar = " ";
      letter.isAnimating = false; 
      letter.color = "#ffffff";
      letter.targetColor = "#ffffff"; 
      letter.colorProgress = 1;
      letter.isAsciiArt = false;
    });
  };

  const morphTextInGrid = (text: string, row: number, startCol: number, shouldAnimate = false) => {
    const { columns, rows: numRows } = grid.current;
    [...text].forEach((char, i) => {
      const col = startCol + i;
      if (col >= 0 && col < columns && row >= 0 && row < numRows) {
        const index = row * columns + col;
        if (letters.current[index]) {
          letters.current[index].originalChar = char;
          if (shouldAnimate) {
            letters.current[index].isAnimating = true;
            setTimeout(() => {
              let flipCount = 0;
              const flip = () => {
                if (flipCount < 3) {
                  letters.current[index].char = getRandomChar();
                  flipCount++;
                  setTimeout(flip, 80);
                } else {
                  letters.current[index].char = char;
                  letters.current[index].isAnimating = false;
                }
              };
              flip();
            }, Math.random() * 500);
          } else {
            letters.current[index].char = char;
          }
        }
      }
    });
  };

  const setTextInGrid = (text: string, row: number, startCol: number, shouldAnimate = false) => {
    const { columns, rows: numRows } = grid.current;
    [...text].forEach((char, i) => {
      const col = startCol + i;
      if (col >= 0 && col < columns && row >= 0 && row < numRows) {
        const index = row * columns + col;
        if (letters.current[index]) {
          letters.current[index].originalChar = char;
          if (shouldAnimate) {
            letters.current[index].isAnimating = true;
            setTimeout(() => {
              let flipCount = 0;
              const flip = () => {
                if (flipCount < 2) {
                  letters.current[index].char = getRandomChar();
                  flipCount++;
                  setTimeout(flip, 80);
                } else {
                  letters.current[index].char = char;
                  letters.current[index].isAnimating = false;
                }
              };
              flip();
            }, 500 + Math.random() * 500);
          } else {
            letters.current[index].char = char;
          }
        }
      }
    });
  };

  const setAsciiInGrid = (shouldAnimate = false) => {
    const { columns, rows } = grid.current;
    const { startRow } = getAsciiPosition(columns, rows);
    asciiArt.forEach((line, lineIndex) => {
      const row = startRow + lineIndex;
      const startCol = Math.floor((columns - line.length) / 2);
      [...line].forEach((char, i) => {
        const col = startCol + i;
        if (col >= 0 && col < columns && row >= 0 && row < rows) {
          const index = row * columns + col;
          if (letters.current[index]) {
            letters.current[index].originalChar = char;
            letters.current[index].isAsciiArt = true;
            if (shouldAnimate) {
              letters.current[index].isAnimating = true;
              setTimeout(() => {
                let flipCount = 0;
                const flip = () => {
                  if (flipCount < 3) {
                    letters.current[index].char = getRandomChar();
                    flipCount++;
                    setTimeout(flip, 100);
                  } else {
                    letters.current[index].char = char;
                    letters.current[index].isAnimating = false;
                  }
                };
                flip();
              }, Math.random() * 1000);
            } else {
              letters.current[index].char = char;
            }
          }
        }
      });
    });
  };

  const drawLetters = () => {
    if (!context.current || !canvasRef.current) return;
    const ctx = context.current;
    const { width, height } = canvasRef.current;
    
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });

    if (hasVignette || centerVignette) {
      const { width: logicalWidth, height: logicalHeight } = canvasRef.current.getBoundingClientRect();
      const centerX = logicalWidth / 2;
      const centerY = logicalHeight / 2;
      const outerRadius = Math.sqrt(centerX**2 + centerY**2);
      
      // Outer vignette (dark edges)
      if (hasVignette) {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, outerRadius * 0.1,
          centerX, centerY, outerRadius * 1.2
        );
        gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
        gradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.4)');
        gradient.addColorStop(1, 'rgba(10, 10, 10, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
      }
      
      // Center vignette (dark center)
      if (centerVignette) {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, outerRadius * 0.6
        );
        gradient.addColorStop(0, 'rgba(10, 10, 10, 0.8)');
        gradient.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
      }
    }
  };

  const updateBackgroundGlitch = () => {
    const { columns, rows } = grid.current;
    if (columns === 0 || rows === 0) return;

    const centerX = Math.floor(columns / 2);
    const centerY = Math.floor(rows / 2);
    
    // Normalize coordinates to account for character aspect ratio
    const aspectRatio = charHeight / charWidth; // 20/10 = 2
    const normalizedCenterX = centerX;
    const normalizedCenterY = centerY * aspectRatio;
    const maxRadius = Math.sqrt(normalizedCenterX ** 2 + normalizedCenterY ** 2);
    const glitchRadius = scrollIntensityRef.current * maxRadius;

    letters.current.forEach((letter, index) => {
      if (letter.originalChar !== " ") return;

      const x = index % columns;
      const y = Math.floor(index / columns);
      
      // Apply the same normalization to the letter coordinates
      const normalizedX = x;
      const normalizedY = y * aspectRatio;
      const distance = Math.sqrt((normalizedX - normalizedCenterX) ** 2 + (normalizedY - normalizedCenterY) ** 2);

      if (distance <= glitchRadius) {
        if (letter.char === ' ' && Math.random() > 0.95) {
          letter.char = getRandomChar();
          letter.targetColor = getRandomColor();
          letter.colorProgress = 0;
        } else if (letter.char !== ' ' && Math.random() > 0.9) {
          letter.char = ' ';
        }
      } else {
        letter.char = " ";
      }
    });
  };

  const handleSmoothTransitions = () => {
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress = Math.min(1, letter.colorProgress + 0.1);
        const startRgb = hexToRgb(letter.color) || { r: 0, g: 0, b: 0 };
        const endRgb = hexToRgb(letter.targetColor);
        if (endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
        }
      }
    });
  };

  const setScrollIndicator = () => {
    const { columns, rows } = grid.current;
    const indicatorText = "↓ SCROLL DOWN ↓";
    const indicatorRow = rows - 8;
    const startCol = Math.floor((columns - indicatorText.length) / 2);
    
    [...indicatorText].forEach((char, i) => {
      const col = startCol + i;
      if (col >= 0 && col < columns && indicatorRow >= 0 && indicatorRow < rows) {
        const index = indicatorRow * columns + col;
        if (letters.current[index]) {
          letters.current[index].originalChar = char;
          letters.current[index].char = char;
          letters.current[index].color = "#4F4F4F";
          letters.current[index].targetColor = "#4F4F4F";
          letters.current[index].colorProgress = 1;
        }
      }
    });
  };

  const animate = () => {
    const now = Date.now();
    
    // Use the ref to check the current animation phase.
    if (animationPhaseRef.current === 0) {
      if (now - lastBlinkTime.current >= 500) {
        blinkRef.current = !blinkRef.current;
        const { columns, rows } = grid.current;
        const centerIndex = Math.floor(rows / 2) * columns + Math.floor(columns / 2);
        if (letters.current[centerIndex] && !letters.current[centerIndex].isAnimating) {
          letters.current[centerIndex].char = blinkRef.current ? "_" : " ";
        }
        lastBlinkTime.current = now;
      }
    }

    // Use the ref to check phase for glitching.
    if (animationPhaseRef.current >= 4) {
      if (now - lastGlitchTime.current >= glitchSpeed) {
        updateBackgroundGlitch();
        lastGlitchTime.current = now;
      }
    }
    
    if (smooth) handleSmoothTransitions();
    
    drawLetters();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const checkWidth = () => {
      const wide = window.innerWidth >= minWidth;
      setIsWideEnough(wide);
      if (!wide && !animationCompleted) {
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          setAnimationCompleted(true);
        }, 500);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [onAnimationComplete, animationCompleted]);

  useEffect(() => {
    if (!isWideEnough || !isInitialized || grid.current.columns === 0) return;

    if (disableIntro) {
      setAnimationPhase(4);
      if (!animationCompleted) {
        setAnimationCompleted(true);
        onAnimationComplete?.();
      }
      return;
    }

    switch (animationPhase) {
      case 0:
        setTimeout(() => setAnimationPhase(1), 2000);
        break;
      
      case 1:
        setTimeout(() => {
          clearText(false);
          const line1 = t("letterGlitch.line1");
          const line2 = t("letterGlitch.line2");

          const { textRow: row1, startCol: col1 } = getTextPosition(line1, grid.current.columns, grid.current.rows, -1);
          const { textRow: row2, startCol: col2 } = getTextPosition(line2, grid.current.columns, grid.current.rows, 0);

          morphTextInGrid(line1, row1, col1, true);
          morphTextInGrid(line2, row2, col2, true);

          setTimeout(() => setAnimationPhase(2), 3000);
        }, 100);
        break;

      case 2:
        setTimeout(() => {
          clearText(false);
          const line1 = t("letterGlitch.line3");
          const line2 = t("letterGlitch.line4");

          const { textRow: row1, startCol: col1 } = getTextPosition(line1, grid.current.columns, grid.current.rows, -1);
          const { textRow: row2, startCol: col2 } = getTextPosition(line2, grid.current.columns, grid.current.rows, 0);
          
          morphTextInGrid(line1, row1, col1, true);
          morphTextInGrid(line2, row2, col2, true);
          
          setTimeout(() => setAnimationPhase(3), 3000);
        }, 100);
        break;

      case 3:
        setTimeout(() => {
          clearText(false);
          setAsciiInGrid(true);
          setTimeout(() => {
            setScrollIndicator();
            setAnimationPhase(4);
            setTimeout(() => {
              if (!animationCompleted) {
                setAnimationCompleted(true);
                onAnimationComplete?.();
              }
            }, 1000);
          }, 1500);
        }, 100);
        break;

      case 4: 
        break;
    }
  }, [animationPhase, isInitialized, animationCompleted, isWideEnough, t, disableIntro, onAnimationComplete]);

  useEffect(() => {
    if (!isWideEnough) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext("2d");

    let resizeTimeout: NodeJS.Timeout;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return false;
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.current?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { columns, rows } = calculateGrid(rect.width, rect.height);
      initializeLetters(columns, rows);
      return true;
    };

    const initializeAndStart = () => {
      if (!resizeCanvas()) {
        requestAnimationFrame(initializeAndStart);
        return;
      }
      setIsInitialized(true);
      if (!animationRef.current) animate();
    };
    
    initializeAndStart();

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        setIsInitialized(false);
        setAnimationPhase(0);
        // No need to call initializeAndStart() here as the checkWidth in the other useEffect will trigger a re-render
        // which will re-run this effect if isWideEnough becomes true.
      }, 100);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.5;
      scrollIntensityRef.current = Math.min(scrollY / maxScroll, 1);
    };
    
    if (disableIntro) {
      scrollIntensityRef.current = 1;
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      if (!disableIntro) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isWideEnough, disableIntro]);

  const containerStyle: React.CSSProperties = {
    position: "relative", width: "100%", height: "100vh",
    backgroundColor: "#0A0A0A", overflow: "hidden",
  };
  const canvasStyle: React.CSSProperties = {
    display: "block", width: "100%", height: "100%",
  };

  return (
    <div style={containerStyle}>
      {isWideEnough ? (
        <canvas ref={canvasRef} style={canvasStyle} />
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          color: '#ffffff',
          fontSize: '2rem',
          fontFamily: 'monospace',
          padding: '1rem',
          textAlign: 'center'
        }}>
          Studio Harry Chang
        </div>
      )}
    </div>
  );
};

export default LetterGlitch;
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/letter-glitch.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(main)/manifesto/page.tsx>
"use client";
import { useState, useEffect, useRef } from 'react';
import LetterGlitch from '@/components/letter-glitch';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/language-switcher';

const manifestoChunksEn = [
    [
        "I am the child who saw marvels in LEGO bricks,",
        "Not for their colors, but for the sacred geometry within—",
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
        `Is a conversation with that child who asked not "Is this useful?"`,
        `But "What worlds can this create?"`
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
        <div className="min-h-screen font-mono bg-[#0A0A0A] text-gray-300">
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
                        <article className="space-y-24 bg-[#0A0A0A]/50 backdrop-blur-sm p-8 md:p-12 rounded-lg">
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
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(main)/manifesto/page.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/hooks/use-mobile.tsx>
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/hooks/use-mobile.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/prisma/schema.prisma>
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}

model WaitlistEntry {
  id            String   @id @default(cuid())
  email         String   @unique
  firstName     String?
  lastName      String?
  interests     String[] // ['ai-safety', 'portfolio', 'speaking', etc]
  referralSource String? // 'twitter', 'linkedin', 'word-of-mouth'
  locale        String   @default("en")
  tier          String?  // 'foundation', 'cohort', 'premium'
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Marketing fields
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  
  // Engagement tracking
  emailVerified Boolean  @default(false)
  verificationToken String? @unique
  
  @@index([email])
  @@index([createdAt])
}

model EmailCampaign {
  id        String   @id @default(cuid())
  subject   String
  sentAt    DateTime @default(now())
  sentTo    String[] // Array of email IDs
  openRate  Float?
  clickRate Float?
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/prisma/schema.prisma>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/studio/ClientLayout.tsx>
"use client"

import type React from "react"
import { LanguageProvider } from "@/contexts/LanguageContext"
import Header from "@/components/header"
/**
 * Client layout wrapper for the Studio subdomain.
 * Provides necessary client-side context providers (e.g., LanguageContext)
 * without the main site's header/footer.
 */
export default function StudioClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/studio/ClientLayout.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(main)/layout.tsx>
import '@/styles/lcp-optimize.css'
import '@/styles/video-embed.css'
import type React from 'react'
import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientLayout from '@/components/main/ClientLayout'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://harrychang.me'),
  title: {
    template: '%s | Harry Chang',
    default: 'Harry Chang 張祺煒 | Portfolio',
  },
  description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
  keywords: ['Harry Chang', '張祺煒', 'portfolio', 'photography', 'development', 'design', 'research', 'AI', 'machine learning'],
  authors: [{ name: 'Harry Chang', url: 'https://harrychang.me' }],
  creator: 'Harry Chang',
  publisher: 'Harry Chang',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh-TW': '/?lang=zh-TW',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    url: 'https://harrychang.me',
    siteName: 'Harry Chang Portfolio',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Harry Chang Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
    creator: '@harrychangtw',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any'
      }
    ],
    apple: {
      url: '/apple-icon.png',
      type: 'image/png'
    },
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000'
      }
    ]
  },
  verification: {
    // Add your verification codes here when you get them (optional)
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Website structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Harry Chang',
    alternateName: '張祺煒',
    url: 'https://harrychang.me',
    sameAs: [
      // Add your social media profiles here
      'https://github.com/Harrychangtw',
      // 'https://twitter.com/harrychangtw',
      // 'https://linkedin.com/in/harrychangtw',
    ],
    jobTitle: 'Developer & Researcher',
    description: 'Portfolio showcasing photography, development, and design work',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClientLayout>
        <div className="flex-1 pt-16">
          {children}
        </div>
        <Footer />
        <SpeedInsights />
      </ClientLayout>
    </>
  )
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(main)/layout.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/layout.tsx>
import './globals.css'
import type React from 'react'
import { Space_Grotesk, Press_Start_2P, IBM_Plex_Sans } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body className={`bg-background text-primary antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  )
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/layout.tsx>

