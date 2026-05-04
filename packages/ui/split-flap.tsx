"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

// Vestaboard-style character cycling on language switch.
// Per-character stagger inside a string + per-component stagger seeded by the
// element's vertical position, so further-down nodes start later.

const LATIN_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CYCLES = 5;
const STEP_MS = 38;
const CHAR_STAGGER_MS = 22;
const VERTICAL_STAGGER_MS_PER_PX = 0.35; // ~280ms across an 800px viewport

const isCJK = (ch: string) => /[㐀-鿿豈-﫿]/.test(ch);

function pickGlyph(target: string, pool: string[]): string {
  if (!target || target === " ") return target;
  if (isCJK(target)) {
    // Sample from chars actually present in old+new strings — visually coherent
    // and avoids landing on rare radicals from arithmetic on charCodeAt.
    const cjk = pool.filter(isCJK);
    return cjk.length
      ? cjk[Math.floor(Math.random() * cjk.length)]
      : target;
  }
  if (/\d/.test(target)) return String(Math.floor(Math.random() * 10));
  if (/[a-zA-Z]/.test(target)) {
    const ch = LATIN_UPPER[Math.floor(Math.random() * LATIN_UPPER.length)];
    return /[a-z]/.test(target) ? ch.toLowerCase() : ch;
  }
  return target;
}

export function SplitFlap({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { transitionTick } = useLanguage();
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const lastTickRef = useRef(transitionTick);
  const prevTextRef = useRef(text);
  const timersRef = useRef<number[]>([]);
  const elRef = useRef<HTMLSpanElement | null>(null);

  // Keep display in sync when no transition is active (e.g. text loaded late).
  useEffect(() => {
    if (transitionTick === lastTickRef.current) {
      setDisplay(text);
      prevTextRef.current = text;
    }
  }, [text, transitionTick]);

  useEffect(() => {
    if (transitionTick === lastTickRef.current) return;
    lastTickRef.current = transitionTick;

    const target = text;
    const old = prevTextRef.current;
    prevTextRef.current = target;

    if (reduce || !target) {
      setDisplay(target);
      return;
    }

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const maxLen = Math.max(target.length, old.length);
    const chars = Array.from({ length: maxLen }, (_, i) => old[i] ?? " ");
    const pool = Array.from(new Set([...old, ...target]));

    // Vertical-position stagger: read once at transition start.
    const top = elRef.current?.getBoundingClientRect().top ?? 0;
    const offsetMs = Math.max(0, top) * VERTICAL_STAGGER_MS_PER_PX;

    const commit = () => setDisplay(chars.join(""));

    for (let i = 0; i < maxLen; i++) {
      const base = offsetMs + i * CHAR_STAGGER_MS;
      for (let c = 0; c < CYCLES; c++) {
        const handle = window.setTimeout(() => {
          chars[i] = pickGlyph(target[i] ?? " ", pool);
          commit();
        }, base + c * STEP_MS);
        timersRef.current.push(handle);
      }
      const settle = window.setTimeout(() => {
        chars[i] = target[i] ?? "";
        commit();
      }, base + CYCLES * STEP_MS);
      timersRef.current.push(settle);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [text, transitionTick, reduce]);

  return (
    <span ref={elRef} className={className}>
      {display}
    </span>
  );
}
