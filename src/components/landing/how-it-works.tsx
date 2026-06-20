"use client";

import { Wand2, SlidersHorizontal, Share2 } from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";
import { AnimatedItem } from "@/components/landing/animated-section";

const STEPS = [
  {
    icon: Wand2,
    step: "01",
    title: "Create",
    description:
      "Start from a template or a blank canvas. Pick a tool, choose your style, and let your idea take shape in minutes.",
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Customize",
    description:
      "Tweak colors, layers, and effects. Use version history and smart guides to refine your work until it's perfect.",
  },
  {
    icon: Share2,
    step: "03",
    title: "Share",
    description:
      "Export in your favorite format, invite collaborators, or publish — all from one secure workspace in the cloud.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="relative scroll-mt-20 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to export in three steps"
          description="A workflow that gets out of your way. Create, customize, and share — without leaving your browser."
        />

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          {/* connector line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {STEPS.map((step, i) => (
            <AnimatedItem key={step.title} delay={i * 0.1} className="relative">
              <div className="relative flex h-full flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex w-full items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-primary">
                    <step.icon className="size-6" />
                  </div>
                  <span className="text-4xl font-extrabold text-muted-foreground/30">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
}
