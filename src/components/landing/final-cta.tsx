"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-primary/40 bg-gradient-brand p-8 text-center shadow-2xl shadow-primary/30 sm:p-12 lg:p-16"
      >
        {/* animated gradient overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-gradient bg-gradient-to-r from-primary via-secondary to-primary opacity-40"
          style={{ backgroundSize: "200% 200%" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid-pattern opacity-20"
        />

        <div className="relative flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Sparkles className="size-3.5" />
            Free to start · No credit card
          </span>

          <h2
            id="final-cta-heading"
            className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Ready to create without limits?
          </h2>

          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            Design with layers, animate, edit, or start from a template — a full
            professional toolset in one free, browser-based studio. Start on the
            Free plan and upgrade only when you need more.
          </p>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary shadow-lg hover:bg-white/90"
            >
              <Link href="/signup">
                Start Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="#pricing">Compare Plans</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
