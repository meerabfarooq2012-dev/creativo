"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2,
  Mail,
  ArrowLeft,
  MailCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

interface ForgotResponse {
  ok?: boolean;
  message?: string;
  error?: string;
  devResetUrl?: string;
}

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [devResetUrl, setDevResetUrl] = React.useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data: ForgotResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
        return;
      }

      setSubmittedEmail(values.email);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
      setSubmitted(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 hidden lg:block">
            <CreativoLogo size="lg" />
          </div>

          {submitted ? (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/40"
              >
                <MailCheck className="h-7 w-7 text-success" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Check your email
              </CardTitle>
              <CardDescription>
                If an account exists for{" "}
                <span className="font-medium text-foreground">
                  {submittedEmail}
                </span>
                , a reset link is on its way.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Forgot password?
              </CardTitle>
              <CardDescription>
                Enter your account email and we&apos;ll send you a secure link to
                reset your password.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">
                      Reset link generated.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      In production, this link would be sent via email. For the
                      demo flow, use the link below:
                    </p>
                  </div>
                </div>
              </div>

              {devResetUrl && (
                <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Demo reset link
                  </p>
                  <Link
                    href={devResetUrl}
                    className="group flex items-center justify-between gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    <span className="truncate">Open reset password page</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setDevResetUrl(null);
                }}
              >
                Try a different email
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Back to login
                </Link>
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-brand text-white shadow-lg transition-transform hover:scale-[1.01] hover:shadow-glow-primary"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
