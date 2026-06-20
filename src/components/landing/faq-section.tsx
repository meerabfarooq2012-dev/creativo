"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/landing/section-heading";

const FAQS = [
  {
    q: "How does the 30-day free trial work?",
    a: "Sign up for any paid plan and your 30-day trial starts automatically — no credit card required. You get full access to every feature in that plan. We'll remind you before the trial ends so you can choose to stay on the plan or drop down to the Free plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time from your account settings. After cancellation, you keep access until the end of your current billing period, then your account automatically drops to the Free plan. No questions asked.",
  },
  {
    q: "What payment methods do you accept?",
    a: "During the foundation phase, payments are not yet activated — you can try every plan free for 30 days. Once billing launches, we will accept major credit cards (Visa, Mastercard, American Express), and select regional methods. Stay tuned for updates.",
  },
  {
    q: "Do you offer a student discount?",
    a: "Absolutely. Our Student plan is heavily discounted at $4/month (or $40/year) and includes premium templates, SVG/PDF export, and no watermarks. Just sign up with a valid .edu (or equivalent educational) email address to verify eligibility.",
  },
  {
    q: "How does team collaboration work?",
    a: "The Team plan supports up to 25 members with a shared asset library, granular permissions, an admin console, and audit logs. Invite teammates by email, assign roles, and co-create in real time — everyone stays in sync via secure cloud storage.",
  },
  {
    q: "Is my data secure?",
    a: "Security is a first-class citizen. All assets are stored encrypted at rest and in transit, access is governed by role-based permissions, and Team plans include audit logs so you always know who did what. We never sell your data — ever.",
  },
  {
    q: "What file formats are supported?",
    a: "Free plans can export to PNG and JPG. Student plans add SVG and PDF. Pro and Team plans unlock all export formats including high-resolution PNG, JPG, SVG, PDF, and layered project files. Import support covers common image formats and Creativo project files.",
  },
  {
    q: "What support options are available?",
    a: "Free users get community support. Student and Pro users get priority email support with fast response times. Team plans add priority phone support and an SLA guarantee so your studio never waits when it matters most.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-20 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know about Creativo, pricing, and your free trial."
        />

        <div className="mt-12 rounded-2xl border border-border bg-card p-2 sm:p-4">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="border-border px-2 sm:px-4"
              >
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
