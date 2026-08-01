'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { OrderChannelButtons } from '@/components/shared/OrderChannelButtons';
import { siteConfig } from '@/lib/config';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1782539012433-15805752cbaa?w=1800&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tbc-black via-tbc-black/80 to-tbc-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-tbc-black/70 via-transparent to-transparent" />
      </div>

      <Container className="flex min-h-[85vh] flex-col items-start justify-center py-24">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-block rounded-full border border-tbc-gold-400/40 bg-tbc-black/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-tbc-gold-400 backdrop-blur-sm"
        >
          Premium Cloud Kitchen
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl 2xl:text-7xl"
        >
          {siteConfig.tagline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-xl text-lg text-tbc-cream-muted 2xl:text-xl"
        >
          {siteConfig.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <OrderChannelButtons />
        </motion.div>
      </Container>
    </section>
  );
}
