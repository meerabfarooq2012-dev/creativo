"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ArrowRight } from "lucide-react";

import { CreativoLogo } from "@/components/shared/creativo-logo";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Mobile navigation drawer.
 *
 * The Radix Sheet (Dialog) is rendered only after the component mounts on the
 * client. Before mount — including during SSR — a visually identical
 * placeholder button is shown instead. This guarantees no Radix-generated
 * `aria-controls` / `useId` values are present in the server-rendered HTML,
 * which eliminates the hydration mismatch on the Sheet trigger.
 */
export function MobileNav() {
  const mounted = useMounted();
  const [open, setOpen] = React.useState(false);

  if (!mounted) {
    // Placeholder: same dimensions/styling as the real trigger so there's no
    // layout shift. Non-functional only for the brief pre-hydration paint.
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation menu"
        disabled
      >
        <Menu className="size-5" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 max-w-[85vw]">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center">
            <CreativoLogo size="sm" />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to sections of the Creativo landing page.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-border px-6 py-6">
          <SheetClose asChild>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              asChild
              className="bg-gradient-brand text-white hover:opacity-90"
            >
              <Link href="/signup">
                Start Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
