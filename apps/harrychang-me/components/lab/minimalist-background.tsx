"use client";

import { useState } from "react";
import { motion } from "motion/react";

function generateParticles() {
  return Array.from({ length: 100 }, () => ({
    duration: 1 + Math.random() * 10,
    delay: Math.random() * 5,
    width: Math.random() * 4 + 1,
    height: Math.random() * 4 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
  }));
}

export default function MinimalistBackground() {
  const [particles] = useState(generateParticles);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base background - transitions smoothly */}
      <div className="absolute inset-0 bg-background transition-colors duration-500" />

      {/* Multi-layer animated arc container */}
      <motion.div className="absolute inset-0">
        {/* Arc edge - Layer 3 (sharp edge) */}
        <motion.div
          className="absolute bottom-[-75vh] inset-x-[-50vw] md:inset-x-[-25vw] w-[200vw] md:w-[150vw] h-[100vh] mx-auto"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.5,
          }}
        >
          {/* Sharp arc edge with shadow using foreground color for contrast in both modes */}
          <div
            className="absolute inset-0 rounded-[100%]"
            style={{
              background: "transparent",
              boxShadow:
                "inset 0px 2px 20px 0px hsl(var(--foreground)), 0px -10px 50px 1px hsl(var(--foreground) / 0.5)",
            }}
          />
        </motion.div>

        {/* Arc glow effect - Layer 2 (middle layer) */}
        <motion.div
          className="absolute bottom-[-75vh] inset-x-[-55vw] md:inset-x-[-25vw] w-[200vw] md:w-[150vw] h-[100vh] mx-auto"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.3,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.8,
          }}
        >
          {/* Main glow layer */}
          <div
            className="absolute inset-0 rounded-[100%]"
            style={{
              background:
                "radial-gradient(ellipse at center top, hsl(var(--foreground) / 0.3) 0%, hsl(var(--foreground) / 0.08) 20%, hsl(var(--foreground) / 0.03) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </motion.div>

        {/* Top gradient fade - animated */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[40vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 1,
          }}
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background) / 0) 100%)",
          }}
        />
      </motion.div>

      {/* Left and Right vignette fade - animated */}
      <motion.div
        className="absolute inset-0 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
          delay: 0.2,
        }}
      >
        {/* Left fade */}
        <div
          className="flex-1 h-full"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--background)) 0%, hsl(var(--background) / 0) 100%)",
          }}
        />
        {/* Center transparent area */}
        <div className="w-[25vw] h-full" />
        {/* Right fade */}
        <div
          className="flex-1 h-full"
          style={{
            background:
              "linear-gradient(270deg, hsl(var(--background)) 0%, hsl(var(--background) / 0) 100%)",
          }}
        />
      </motion.div>

      {/* Subtle animated particles effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          ease: "easeOut",
          delay: 0,
        }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-foreground"
            initial={{
              opacity: 0,
              y: 100,
            }}
            animate={{
              opacity: [0, 0.2, 0.2, 0],
              y: -100,
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: i * 0.2 + p.delay,
              ease: "easeInOut",
            }}
            style={{
              width: p.width + "px",
              height: p.height + "px",
              top: p.top + "%",
              left: p.left + "%",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
