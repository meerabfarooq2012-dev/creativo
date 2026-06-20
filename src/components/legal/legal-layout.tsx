import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreativoLogo } from "@/components/shared/creativo-logo";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

interface LegalSection {
  id: string;
  title: string;
  /** Each item is rendered as a paragraph or a list group. */
  items: (string | string[])[];
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Shared layout for legal pages (Privacy Policy, Terms of Service, etc.).
 * Dark-themed, responsive, sticky footer, server component.
 */
export function LegalLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          {/* Header */}
          <header className="mt-6 border-b border-border pb-8">
            <div className="mb-4 flex items-center gap-2">
              <CreativoLogo size="sm" showText={false} />
              <span className="text-sm font-medium text-muted-foreground">
                Creativo
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>
          </header>

          {/* Intro */}
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {sections.map((section, idx) => (
              <section key={section.id} aria-labelledby={`${section.id}-heading`}>
                <h2
                  id={`${section.id}-heading`}
                  className="flex items-center gap-3 text-xl font-bold text-foreground"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3 pl-10">
                  {section.items.map((item, i) =>
                    Array.isArray(item) ? (
                      <ul key={i} className="space-y-2">
                        {item.map((line, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                          >
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-muted-foreground"
                      >
                        {item}
                      </p>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Closing note */}
          <div className="mt-14 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <CreativoLogo size="sm" showText={false} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Questions about this policy?
                </p>
                <p className="text-sm text-muted-foreground">
                  Reach our team via the Support section inside your dashboard,
                  or email{" "}
                  <a
                    href="mailto:privacy@creativo.app"
                    className="font-medium text-primary hover:underline"
                  >
                    privacy@creativo.app
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
