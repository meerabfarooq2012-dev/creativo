"use client";

import { Star, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/landing/section-heading";
import { AnimatedItem } from "@/components/landing/animated-section";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
  accent: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Maya Chen",
    role: "Brand Designer · Studio North",
    quote:
      "Creativo replaced three tools in my workflow. The Design Studio is fast, intuitive, and the cloud sync means my team is always in sync.",
    initials: "MC",
    accent: "from-purple-500 to-blue-500",
  },
  {
    name: "Daniel Okafor",
    role: "Illustrator & Content Creator",
    quote:
      "The illustration brushes feel natural and the layers system just makes sense. It's the first creative app that keeps up with me.",
    initials: "DO",
    accent: "from-fuchsia-500 to-violet-500",
  },
  {
    name: "Sofia Rossi",
    role: "Freelance Photographer",
    quote:
      "Photo editing on Creativo is a dream — masks, layers, exports. I deliver client work faster and the version history has saved me more than once.",
    initials: "SR",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    name: "Arjun Patel",
    role: "Creative Director · Lumen Labs",
    quote:
      "We onboarded our whole studio on the Team plan. Shared asset library and permissions just work. Onboarding new designers takes minutes now.",
    initials: "AP",
    accent: "from-amber-500 to-orange-500",
  },
  {
    name: "Hannah Müller",
    role: "Student · Visual Communication",
    quote:
      "The student plan is genuinely generous. Premium templates and no watermarks let me build a portfolio I'm proud to send to recruiters.",
    initials: "HM",
    accent: "from-pink-500 to-rose-500",
  },
  {
    name: "Tomás Álvarez",
    role: "Indie Game Artist",
    quote:
      "From sketch to final export, everything stays in one place. Cloud storage means I can switch from laptop to tablet without losing a beat.",
    initials: "TA",
    accent: "from-cyan-500 to-sky-500",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative scroll-mt-20 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by creators worldwide"
          description="Join 50,000+ designers, illustrators, and studios who create without limits every day."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <AnimatedItem key={t.name} delay={(i % 3) * 0.08} className="h-full">
              <TestimonialCard testimonial={t} />
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-warning text-warning"
              aria-hidden
            />
          ))}
        </div>
        <Quote className="size-6 text-primary/30" aria-hidden />
      </div>

      <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Avatar className="size-10 border border-border">
          <AvatarFallback
            className={cn(
              "bg-gradient-to-br text-white font-semibold",
              testimonial.accent
            )}
          >
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {testimonial.name}
          </span>
          <span className="text-xs text-muted-foreground">{testimonial.role}</span>
        </div>
      </div>
    </article>
  );
}
