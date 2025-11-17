"use client";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext";

interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  smooth?: boolean;
  onAnimationComplete?: () => void;
}

const LetterGlitch = ({
  glitchColors = ["#2b4539", "hsl(var(--accent))", "#61b3dc"],
  glitchSpeed = 50,
  smooth = true,
  onAnimationComplete
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
    "          \"ᴛʜᴇ ᴄʜɪʟᴅ ɪ ᴏɴᴄᴇ ᴡᴀꜱ\"             ",
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
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
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
  }, [animationPhase, isInitialized, animationCompleted, isWideEnough, t]);

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
      // Update the ref directly. No re-render needed for this.
      scrollIntensityRef.current = Math.min(scrollY / maxScroll, 1);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isWideEnough]);

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
          L'enfant que j'étais
        </div>
      )}
    </div>
  );
};

export default LetterGlitch;
