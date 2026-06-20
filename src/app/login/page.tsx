"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn, KeyRound } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { CreativoLogo } from "@/components/shared/creativo-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@creativo.app", password: "Admin@2024" },
  { label: "Creator", email: "creator@creativo.app", password: "Demo@2024" },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") || searchParams.get("next") || "/dashboard";
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setValue("email", account.email);
    setValue("password", account.password);
    toast.success(`Filled ${account.label} demo credentials`);
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!res || res.error) {
        const reason = res?.error === "CredentialsSignin"
          ? "Invalid email or password. Please try again."
          : res?.error || "Login failed. Please try again.";
        toast.error(reason);
        return;
      }

      toast.success("Welcome back to Creativo!");

      // Determine redirect target based on user role
      let target = callbackUrl;
      try {
        // small delay to let the session cookie propagate
        await new Promise((r) => setTimeout(r, 200));
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role as string | undefined;
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
          target = "/admin";
        }
      } catch {
        // fall back to callbackUrl
      }
      // Use a full-page navigation so the session cookie is firmly
      // established before the protected route's middleware runs.
      // This avoids redirect loops in proxied environments.
      window.location.href = target;
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
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to your Creativo workspace to continue creating.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked {...register("remember")} />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border/60 bg-gradient-brand-soft p-3"
          >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5" />
              Demo credentials — click to autofill
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="rounded-md border border-border/60 bg-card/60 px-2.5 py-2 text-left transition-colors hover:border-primary/60 hover:bg-card"
                >
                  <p className="text-xs font-semibold text-foreground">
                    {account.label}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {account.email}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {account.password}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </React.Suspense>
  );
}
