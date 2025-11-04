"use client";
import { easeIn, easeInOut, easeOut, motion } from 'framer-motion';

export default function AnimatedIcarusIcon() {
  const iconParts = [
    { src: '/images/icarus_icon/left_180.png', initial: { rotate: 90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, transition: { delay: 0.2, duration: 1.5 }, ease: easeOut },
    { src: '/images/icarus_icon/left_135.png', initial: { rotate: 45, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, transition: { delay: 0.5, duration: 0.7 }, ease: easeOut },
    { src: '/images/icarus_icon/right_45.png', initial: { rotate: -45, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, transition: { delay: 0.5, duration: 0.7 }, ease: easeOut },
    { src: '/images/icarus_icon/right_0.png', initial: { rotate: -90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, transition: { delay: 0.2, duration: 1.5 }, ease: easeOut },
    { src: '/images/icarus_icon/middle_90.png', initial: { opacity: 0.3 }, animate: { opacity: 1 }, transition: { delay: 0, duration: 0.5 } },
    { src: '/images/icarus_icon/arrow.png', initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 1, duration: 1.5 }, ease: easeOut },
  ];

  return (
    <div className="relative w-8 h-8 mb-8 mt-4">
      {iconParts.map((part, index) => (
        <motion.img
          key={index}
          src={part.src}
          alt={`Icarus Icon Part ${index + 1}`}
          className="absolute top-0 left-0 w-full h-full"
          initial={part.initial}
          animate={part.animate}
          transition={part.transition}
        />
      ))}
    </div>
  );
}
