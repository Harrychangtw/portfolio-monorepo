// components/minimalist-background.tsx
'use client';

import { motion } from 'framer-motion';

export default function MinimalistBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Multi-layer animated arc container */}
      <motion.div 
        className="absolute inset-0"
      >
        

       

        {/* Arc edge - Layer 3 (sharp edge) */}
        <motion.div 
          className="absolute bottom-[-80vh] inset-x-[-50vw] md:inset-x-[-25vw] w-[200vw] md:w-[150vw] h-[100vh] mx-auto"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 1.2,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.5
          }}
        >
          {/* Sharp arc edge with shadow */}
          <div 
            className="absolute inset-0 rounded-[100%]"
            style={{
              background: 'transparent',
              boxShadow: 'inset 0px 2px 20px 0px rgba(255, 255, 255, 1), 0px -10px 50px 1px rgba(255, 255, 255, 0.5)',
            }}
          />
        </motion.div>
        
         {/* Arc glow effect - Layer 2 (middle layer) */}
        <motion.div 
          className="absolute bottom-[-80vh] inset-x-[-50vw] md:inset-x-[-25vw] w-[200vw] md:w-[150vw] h-[100vh] mx-auto"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1.3,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.8
          }}
        >
          {/* Main glow layer */}
          <div 
            className="absolute inset-0 rounded-[100%]"
            style={{
              background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.03) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </motion.div>
        <motion.div
          className="absolute bottom-[-80vh] inset-x-[-50vw] md:inset-x-[-25vw] w-[200vw] md:w-[150vw] h-[100vh] mx-auto"
          initial={{ opacity: 0, x: "-50%" }}
          animate={{ opacity: [0, 1, 1, 0], x: "0%" }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            delay: 0.5,
            times: [0, 0.2, 0.8, 1]
          }}
        >
          <div
            className="absolute inset-0 rounded-[100%]"
            style={{
              background: 'radial-gradient(circle at 25% 50%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 20%)',

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
            delay: 1
          }}
          style={{
            background: 'linear-gradient(180deg, rgb(10, 10, 10) 0%, rgba(10, 10, 10, 0) 100%)',
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
          delay: 0.2
        }}
      >
        {/* Left fade */}
        <div 
          className="flex-1 h-full"
          style={{
            background: 'linear-gradient(90deg, rgb(10, 10, 10) 0%, rgba(10, 10, 10, 0) 100%)',
          }}
        />
        {/* Center transparent area */}
        <div className="w-[25vw] h-full" />
        {/* Right fade */}
        <div 
          className="flex-1 h-full"
          style={{
            background: 'linear-gradient(270deg, rgb(10, 10, 10) 0%, rgba(10, 10, 10, 0) 100%)',
          }}
        />
      
      </motion.div>

      


      {/* Bottom gradient fade - animated */}
      


      {/* Subtle animated particles effect */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 1,
          ease: "easeOut",
          delay: 0
        }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            initial={{ 
              opacity: 0,
              y: 100
            }}
            animate={{ 
              opacity: [0, 0.2, 0.2, 0],
              y: -100
            }}
            transition={{
              duration: 1 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 0.2 + Math.random() * 5,
              ease: "easeInOut"
            }}
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
