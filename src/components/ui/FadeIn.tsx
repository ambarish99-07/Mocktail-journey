'use client';

import { motion } from 'framer-motion';
import type { HTMLAttributes } from 'react';

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

/** Scroll-triggered fade+rise used consistently across marketing sections. */
export function FadeIn({ children, delay = 0, className, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
