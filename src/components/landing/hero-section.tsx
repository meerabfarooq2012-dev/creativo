"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Palette,
  PenTool,
  Image as ImageIcon,
  Layers,
  Type,
  CheckCircle2,
  Cloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRUST_BADGES = [
  "Free to use forever",
  "No credit card required",
  "Start a free trial before you buy any plan",
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      {/* Background: grid pattern + animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 h-[24rem] w-[24rem] rounded-full bg-secondary/30 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-primary/20 blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start gap-6 text-center lg:text-left"
          >
            <Badge
              variant="outline"
              className="gap-1.5 border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-gradient font-semibold">
                Drag-and-drop templates
              </span>
              <span className="hidden sm:inline">— free to start</span>
            </Badge>

            <h1
              id="hero-heading"
              className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Create
              <span className="text-gradient"> Without </span>
              Limits
            </h1>

            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Creativo is the free Creative Studio for everyone. Pick a
              template, drag and drop your ideas into place, and publish — no
              design experience needed. Design, illustrate, and edit, all in
              your browser.
            </p>

            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-gradient-brand text-white shadow-lg shadow-primary/20 hover:opacity-90 hover:shadow-primary/40"
              >
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {TRUST_BADGES.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="size-4 text-success" />
                  <span>{badge}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: visual showcase */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <HeroShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroShowcase() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="relative">
      {/* Main dashboard mockup card */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-border bg-card/60 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-danger/70" />
            <span className="size-3 rounded-full bg-warning/70" />
            <span className="size-3 rounded-full bg-success/70" />
          </div>
          <div className="ml-3 flex-1 truncate rounded-md border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            creativo.app/studio/design
          </div>
        </div>

        {/* Body: toolbar + canvas + layers */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-0">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-r border-border p-3">
            {[
              { icon: Palette, label: "Design" },
              { icon: PenTool, label: "Pen" },
              { icon: Type, label: "Type" },
              { icon: ImageIcon, label: "Image" },
              { icon: Layers, label: "Layers" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
                title={label}
              >
                <Icon className="size-4" />
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="relative min-h-[260px] bg-gradient-brand-soft p-4 sm:min-h-[300px]">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              {/* Faux artwork */}
              <div className="absolute inset-0 grid-pattern opacity-60" />
              <div className="absolute left-6 top-6 h-20 w-20 rounded-2xl bg-gradient-brand opacity-90 shadow-lg" />
              <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-secondary/80 shadow-lg" />
              <div className="absolute bottom-6 left-10 h-10 w-40 rounded-lg bg-foreground/10" />
              <div className="absolute bottom-12 left-10 h-3 w-28 rounded-full bg-foreground/20" />
              <div className="absolute bottom-6 right-8 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg">
                Export
              </div>
            </div>
          </div>

          {/* Layers panel */}
          <div className="hidden w-32 flex-col gap-2 border-l border-border p-3 sm:flex">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Layers
            </p>
            {["Background", "Shapes", "Text", "Export"].map((layer, i) => (
              <div
                key={layer}
                className={`rounded-md border px-2 py-1.5 text-xs ${
                  i === 1
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-transparent bg-background/40 text-muted-foreground"
                }`}
              >
                {layer}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating tool chips */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { y: [0, -10, 0], rotate: [0, 4, 0] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-4 top-16 z-20 hidden sm:block"
      >
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 shadow-xl backdrop-blur">
          <div className="flex size-7 items-center justify-center rounded-md bg-gradient-brand text-white">
            <PenTool className="size-3.5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold leading-none">Illustration</p>
            <p className="text-muted-foreground">Live brush</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { y: [0, 10, 0], rotate: [0, -4, 0] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 bottom-12 z-20 hidden sm:block"
      >
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 shadow-xl backdrop-blur">
          <div className="flex size-7 items-center justify-center rounded-md bg-secondary text-white">
            <Cloud className="size-3.5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold leading-none">Cloud Sync</p>
            <p className="text-muted-foreground">Auto-saved</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
