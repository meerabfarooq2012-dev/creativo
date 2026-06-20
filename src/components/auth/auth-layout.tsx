"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Palette, Zap, ShieldCheck } from "lucide-react";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  /**
   * Optional override for the showcase panel content. If omitted, the
   * default brand showcase is rendered.
   */
  showcase?: React.ReactNode;
  className?: string;
}

const DEFAULT_FEATURES = [
  {
    icon: Palette,
    title: "Design anything",
    description:
      "A canvas for illustrations, social posts, presentations and beyond.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description:
      "Real-time collaboration and rendering that keeps up with your ideas.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "Role-based access, audit logs and encrypted storage by default.",
  },
];

function DefaultShowcase() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-brand p-10 text-white xl:p-14">
      {/* grid overlay */}
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-60" />
      {/* glow accents */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <CreativoLogo size="lg" showTagline />
      </motion.div>

      <div className="relative z-10 max-w-md">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          The Creative Studio for modern teams
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-5 text-3xl font-bold leading-tight tracking-tight xl:text-4xl"
        >
          Create without limits.
          <br />
          Ship faster, together.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.26 }}
          className="mt-4 text-sm text-white/80 xl:text-base"
        >
          Design, illustrate and edit in one unified workspace built for
          creators, students and professional teams.
        </motion.p>

        <ul className="mt-8 space-y-4">
          {DEFAULT_FEATURES.map((feature, i) => (
            <motion.li
              key={feature.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                <feature.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="text-xs text-white/70">{feature.description}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative z-10 text-xs text-white/60"
      >
        © {new Date().getFullYear()} Creativo. All rights reserved.
      </motion.div>
    </div>
  );
}

export function AuthLayout({ children, showcase, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Showcase — hidden on small screens, visible on lg+ */}
        <aside className="relative hidden lg:block lg:w-1/2 xl:w-[55%]">
          <DefaultShowcase />
          {showcase}
        </aside>

        {/* Form panel */}
        <main
          className={cn(
            "flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8",
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile compact brand header */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <CreativoLogo size="md" />
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>
            </div>

            {children}

            {/* Desktop back-to-home link */}
            <div className="mt-6 hidden text-center lg:block">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
