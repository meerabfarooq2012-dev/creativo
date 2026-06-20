"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { PasswordStrength } from "@/components/auth/password-strength";
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

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/\d/, "Add a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

type Stage = "form" | "success" | "invalid-token";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [stage, setStage] = React.useState<Stage>(token ? "form" : "invalid-token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setStage("invalid-token");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data.error || "Invalid or expired reset token. Please request a new link.";
        toast.error(message);
        if (
          message.toLowerCase().includes("token") ||
          message.toLowerCase().includes("expired")
        ) {
          setStage("invalid-token");
        }
        return;
      }

      toast.success("Password reset successfully!");
      setStage("success");
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

          {stage === "success" && (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/40"
              >
                <CheckCircle2 className="h-7 w-7 text-success" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Password reset
              </CardTitle>
              <CardDescription>
                Your password has been updated. You can now sign in with your new
                password.
              </CardDescription>
            </>
          )}

          {stage === "invalid-token" && (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 ring-1 ring-danger/40"
              >
                <AlertTriangle className="h-7 w-7 text-danger" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Invalid or expired link
              </CardTitle>
              <CardDescription>
                This password reset link is missing, invalid or has expired.
                Please request a new one.
              </CardDescription>
            </>
          )}

          {stage === "form" && (
            <>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Set a new password
              </CardTitle>
              <CardDescription>
                Choose a strong password you haven&apos;t used before.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {stage === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
                <p className="font-medium text-foreground">All set!</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  For your security, this reset link is no longer valid.
                </p>
              </div>
              <Button asChild className="w-full bg-gradient-brand text-white">
                <Link href="/login">Continue to login</Link>
              </Button>
            </motion.div>
          )}

          {stage === "invalid-token" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <Button asChild className="w-full bg-gradient-brand text-white">
                <Link href="/forgot-password">Request new link</Link>
              </Button>
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </motion.div>
          )}

          {stage === "form" && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordValue && (
                  <PasswordStrength value={passwordValue} className="pt-1" />
                )}
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-danger">
                    {errors.confirmPassword.message}
                  </p>
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
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
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

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <AuthLayout>
          <Card className="border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
