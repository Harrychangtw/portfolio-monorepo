"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const LOADING_STATUSES = [
  "Loading",
  "Developing",
  "Focusing",
  "Composing",
  "Adjusting",
  "Rendering",
  "Optimizing",
  "Finalizing",
  "Coloring",
  "Sharpening",
  "Cropping",
  "Scaling",
  "Encoding",
  "Filtering",
  "Blurring",
  "Saturating",
  "Balancing",
  "Brightening",
  "Darkening",
  "Contrasting",
  "Exporting",
  "Converting",
  "Compressing",
  "Denoising",
  "Grading",
  "Masking",
  "Layering",
  "Blending",
  "Merging",
  "Stitching",
  "Warping",
  "Distorting",
  "Inverting",
  "Posterizing",
  "Vignetting",
  "Calibrating",
  "Previewing",
  "Caching",
  "Buffering",
  "Streaming",
  "Transcoding",
  "Demuxing",
  "Muxing",
  "Stabilizing",
  "Tracking",
  "Keying",
  "Matting",
  "Compositing",
  "Sequencing",
  "Trimming",
]


export function ImageLoadingSkeleton({ visible = true }: { visible?: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if(!visible) return
    const interval = setInterval(() => {
      setIndex((prev) => {
        // 3. Cheap randomness (prevents consecutive duplicates)
        let next
        do {
          next = Math.floor(Math.random() * LOADING_STATUSES.length)
        } while (next === prev)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [visible])

  return (
    <div 
      // 2. Define the container type for relative sizing
      style={{ containerType: "size" }}
      className={`absolute inset-0 bg-muted/20 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-auto overflow-hidden flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            // 1. mix-blend-difference for contrast
            // 2. text-[...] with cqmin for relative sizing
            className="text-[clamp(8px,5cqmin,16px)] font-heading font-medium uppercase text-muted-foreground/80 mix-blend-difference"
          >
            {LOADING_STATUSES[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}