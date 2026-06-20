"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Users, FolderKanban, Star, Globe2 } from "lucide-react";

const STATS = [
  {
    icon: Users,
    value: "50K+",
    label: "Creators",
  },
  {
    icon: FolderKanban,
    value: "2M+",
    label: "Projects Created",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Rating",
  },
  {
    icon: Globe2,
    value: "120+",
    label: "Countries",
  },
];

export function StatsBar() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section
      aria-label="Creativo by the numbers"
      className="border-y border-border bg-card/40"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-full border border-border bg-gradient-brand-soft text-primary">
                <stat.icon className="size-5" />
              </div>
              <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                <span className="text-gradient">{stat.value}</span>
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
