"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlanBadge } from "@/components/dashboard/plan-badge";
import { PLANS, TRIAL_DURATION_DAYS } from "@/lib/constants/plans";
import { LANGUAGES } from "@/lib/dashboard/constants";

type ProfileData = {
  fullName?: string | null;
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  website?: string | null;
  email?: string;
  plan?: string;
  trialActive?: boolean;
  trialEndsAt?: string | null;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifySecurity?: boolean;
  language?: string;
  themePreference?: string;
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, password, notifications, theme, language, and account.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
          <TabsTrigger value="profile" className="gap-1 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-1 text-xs sm:text-sm">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 text-xs sm:text-sm">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-1 text-xs sm:text-sm">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-1 text-xs sm:text-sm">
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1 text-xs sm:text-sm">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="theme">
          <ThemeTab />
        </TabsContent>
        <TabsContent value="language">
          <LanguageTab />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useProfile() {
  return useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

function ProfileTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useProfile();
  const [form, setForm] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);

  // Initialize form when data loads
  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName ?? "",
        username: data.username ?? "",
        bio: data.bio ?? "",
        avatarUrl: data.avatarUrl ?? "",
        location: data.location ?? "",
        website: data.website ?? "",
      });
    }
  }, [data]);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message ?? "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={form.fullName ?? ""}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username ?? ""}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="@username"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={form.bio ?? ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell us about yourself…"
            className="min-h-20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input
            id="avatarUrl"
            value={form.avatarUrl ?? ""}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location ?? ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website ?? ""}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} className="bg-gradient-brand">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = next !== confirm && confirm.length > 0;
  const tooShort = next.length > 0 && next.length < 8;
  const canSubmit = current && next.length >= 8 && next === confirm && !saving;

  const onSave = async () => {
    if (mismatch) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Password updated");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e: any) {
      toast.error(e.message ?? "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Password
        </CardTitle>
        <CardDescription>Change your account password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current">Current Password</Label>
          <Input
            id="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-pass">New Password</Label>
          <Input
            id="new-pass"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
          />
          {tooShort && (
            <p className="text-xs text-danger">Password must be at least 8 characters.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {mismatch && <p className="text-xs text-danger">Passwords do not match.</p>}
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={!canSubmit} className="bg-gradient-brand">
            <Lock className="mr-2 h-4 w-4" />
            {saving ? "Updating…" : "Update password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useProfile();
  const [form, setForm] = useState({ notifyEmail: true, notifyPush: true, notifySecurity: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        notifyEmail: data.notifyEmail ?? true,
        notifyPush: data.notifyPush ?? true,
        notifySecurity: data.notifySecurity ?? true,
      });
    }
  }, [data]);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Preferences saved");
      qc.invalidateQueries({ queryKey: ["profile-me"] });
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          label="Email notifications"
          description="Product updates, announcements, and activity."
          checked={form.notifyEmail}
          onCheck={(v) => setForm({ ...form, notifyEmail: v })}
        />
        <ToggleRow
          label="Push notifications"
          description="Real-time alerts in your browser."
          checked={form.notifyPush}
          onCheck={(v) => setForm({ ...form, notifyPush: v })}
        />
        <ToggleRow
          label="Security alerts"
          description="New logins, password changes, and other security events."
          checked={form.notifySecurity}
          onCheck={(v) => setForm({ ...form, notifySecurity: v })}
        />
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} className="bg-gradient-brand">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheck,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheck} />
    </div>
  );
}

function ThemeTab() {
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const onApply = async (value: string) => {
    setTheme(value);
    setSaving(true);
    try {
      await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: value }),
      });
      toast.success(`Theme set to ${value}`);
      qc.invalidateQueries({ queryKey: ["profile-me"] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Theme
        </CardTitle>
        <CardDescription>Choose your preferred appearance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onApply("dark")}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              theme === "dark" ? "border-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="mb-2 h-20 rounded-md bg-gradient-to-br from-slate-900 to-slate-700" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark</span>
              {theme === "dark" && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">Easy on the eyes — default.</p>
          </button>
          <button
            onClick={() => onApply("light")}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              theme === "light" ? "border-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="mb-2 h-20 rounded-md bg-gradient-to-br from-slate-100 to-white border border-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Light</span>
              {theme === "light" && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">Bright and clean.</p>
          </button>
        </div>
        {saving && <p className="mt-2 text-xs text-muted-foreground">Saving…</p>}
      </CardContent>
    </Card>
  );
}

function LanguageTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useProfile();
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setLanguage(data.language ?? "en");
  }, [data]);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Language preference saved");
      qc.invalidateQueries({ queryKey: ["profile-me"] });
    } catch {
      toast.error("Could not save preference");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Language
        </CardTitle>
        <CardDescription>Choose your interface language (visual for foundation).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Interface language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} className="bg-gradient-brand">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save language"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountTab() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data, isLoading } = useProfile();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);

  const plan = data?.plan ?? "FREE";
  const trialActive = data?.trialActive ?? false;
  const trialEndsAt = data?.trialEndsAt;

  const onStartTrial = async () => {
    setTrialLoading(true);
    try {
      const res = await fetch("/api/trial/start", { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed");
      }
      toast.success("30-day Pro trial activated!", {
        description: "You now have access to 50 GB storage and all Pro features.",
      });
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message ?? "Could not start trial");
    } finally {
      setTrialLoading(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      {/* Plan + Trial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Subscription &amp; Trial
          </CardTitle>
          <CardDescription>Manage your plan and trial status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Current plan</p>
              <div className="mt-1 flex items-center gap-2">
                <PlanBadge plan={plan} />
                {trialActive && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Sparkles className="h-3 w-3" />
                    Trial active
                  </Badge>
                )}
              </div>
            </div>
            {trialEndsAt && (
              <p className="text-xs text-muted-foreground">
                Trial ends {new Date(trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {plan === "FREE" && !trialActive && (
            <div className="rounded-lg border border-primary/30 bg-gradient-brand-soft p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Start your {TRIAL_DURATION_DAYS}-day Pro trial</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get 50 GB storage, premium templates, AI Assistant, and more — free for 30 days.
                  </p>
                </div>
                <Button
                  onClick={onStartTrial}
                  disabled={trialLoading}
                  size="sm"
                  className="bg-gradient-brand"
                >
                  {trialLoading ? "Starting…" : "Start Trial"}
                </Button>
              </div>
            </div>
          )}

          {/* Plan list */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Available plans</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLANS.filter((p) => p.name !== "FREE").map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.displayName}</span>
                      {p.isPopular && (
                        <Badge className="bg-gradient-brand text-[10px]">Popular</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${p.priceMonthly}/mo · {p.storageLimitMb >= 1024 ? `${p.storageLimitMb / 1024} GB` : `${p.storageLimitMb} MB`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    title="Payment integration coming soon"
                  >
                    Upgrade
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Payment integration is not enabled in this foundation build. Start a free trial to unlock Pro features.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account, projects, and assets.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, projects, assets, and settings. This action
              cannot be undone. (Disabled in foundation build — please contact support.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.info("Account deletion is not available in the foundation build.");
                setDeleteOpen(false);
                router.push("/dashboard/support");
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Contact support
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
