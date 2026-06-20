"use client";

import * as React from "react";
import {
  Palette,
  PenTool,
  Image as ImageIcon,
  Video,
  Sparkles,
  Cloud,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/landing/section-heading";
import { AnimatedItem } from "@/components/landing/animated-section";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Palette,
    title: "Design Studio",
    description: "Create stunning designs with our intuitive editor.",
  },
  {
    icon: PenTool,
    title: "Illustration Tools",
    description: "Bring your illustrations to life with powerful brushes.",
  },
  {
    icon: ImageIcon,
    title: "Photo Editing",
    description:
      "Professional photo editing at your fingertips — retouch, mask, and export.",
    comingSoon: true,
  },
  {
    icon: Video,
    title: "Video Editing",
    description: "Edit videos with powerful tools and timeline control.",
    comingSoon: true,
  },
  {
    icon: Sparkles,
    title: "Animation",
    description: "Create smooth animations easily with keyframes.",
    comingSoon: true,
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Secure cloud storage for all your assets and projects.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative scroll-mt-20 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to create"
          description="A complete creative toolkit built for modern workflows — from your first sketch to the final export."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <AnimatedItem key={feature.title} delay={i * 0.06}>
              <FeatureCard feature={feature} />
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const { icon: Icon, title, description, comingSoon } = feature;
  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
      )}
    >
      {/* gradient hover wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
      />

      <div className="relative flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-lg shadow-primary/30">
          <Icon className="size-6" />
        </div>
        {comingSoon ? (
          <Badge
            variant="outline"
            className="border-warning/40 bg-warning/10 text-warning"
          >
            Coming Soon
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
