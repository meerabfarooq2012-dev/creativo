"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLANS, formatPrice } from "@/lib/constants/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/landing/section-heading";
import { AnimatedItem } from "@/components/landing/animated-section";

type Billing = "monthly" | "yearly";

export function PricingSection() {
  const [billing, setBilling] = React.useState<Billing>("monthly");

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative scroll-mt-20 py-20 sm:py-24"
    >
      {/* soft background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-60"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start free, upgrade when you're ready. No hidden fees, cancel anytime."
        />

        {/* Billing toggle */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <BillingToggle value={billing} onChange={setBilling} />
          <p className="text-xs text-muted-foreground">
            No payments yet — activate your 30-day free trial after signup.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan, i) => (
            <AnimatedItem key={plan.id} delay={i * 0.06} className="h-full">
              <PricingCard plan={plan} billing={billing} />
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
}

function BillingToggle({
  value,
  onChange,
}: {
  value: Billing;
  onChange: (v: Billing) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Billing period"
      className="inline-flex items-center rounded-full border border-border bg-card p-1"
    >
      {(["monthly", "yearly"] as const).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              active
                ? "bg-gradient-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt}
            {opt === "yearly" ? (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active ? "bg-white/20 text-white" : "bg-success/15 text-success"
                )}
              >
                -17%
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function PricingCard({
  plan,
  billing,
}: {
  plan: (typeof PLANS)[number];
  billing: Billing;
}) {
  const price =
    billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
  const period = price === 0 ? "" : billing === "monthly" ? "/mo" : "/yr";

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300",
        plan.isPopular
          ? "border-primary/70 shadow-xl shadow-primary/20 lg:scale-[1.03]"
          : "border-border hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
      )}
    >
      {plan.isPopular ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gap-1 bg-gradient-brand px-3 py-1 text-white shadow-md">
            <Sparkles className="size-3.5" />
            Most Popular
          </Badge>
        </div>
      ) : null}

      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {plan.displayName}
        </h3>
      </div>

      <p className="mt-1 min-h-[2.5rem] text-sm text-muted-foreground">
        {plan.description}
      </p>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-foreground">
          {formatPrice(price)}
        </span>
        {period ? (
          <span className="pb-1 text-sm text-muted-foreground">{period}</span>
        ) : null}
      </div>
      {billing === "yearly" && price > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          billed annually
        </p>
      ) : (
        <p className="mt-1 text-xs text-transparent select-none">.</p>
      )}

      <Button
        asChild
        className={cn(
          "mt-6 w-full",
          plan.isPopular
            ? "bg-gradient-brand text-white hover:opacity-90"
            : "bg-card text-foreground outline outline-1 outline-border hover:bg-accent"
        )}
        variant={plan.isPopular ? "default" : "outline"}
      >
        <Link href="/signup">
          {plan.cta}
          <ArrowRight className="size-4" />
        </Link>
      </Button>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-3" />
            </span>
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
