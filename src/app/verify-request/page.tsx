"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailCheck, ArrowLeft, RefreshCw } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <AuthLayout>
      <Card className="border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 hidden lg:block">
            <CreativoLogo size="lg" />
          </div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand-soft ring-1 ring-primary/40"
          >
            <MailCheck className="h-8 w-8 text-primary" />
          </motion.div>

          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="mx-auto max-w-sm">
            We&apos;ve sent a verification link to your inbox. Click the link
            inside to confirm your email address and activate your Creativo
            account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  1
                </span>
                Open the email from{" "}
                <span className="font-medium text-foreground">
                  no-reply@creativo.app
                </span>
                .
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  2
                </span>
                Click the verification link inside.
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  3
                </span>
                You&apos;ll be redirected back to your dashboard.
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Tip:</span> Didn&apos;t
              receive the email? Check your spam folder or wait a couple of
              minutes for it to arrive.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Resend email
            </Button>
            <Button asChild className="w-full bg-gradient-brand text-white">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
