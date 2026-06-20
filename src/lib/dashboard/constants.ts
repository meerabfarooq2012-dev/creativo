// Shared dashboard constants & helpers

export const PROJECT_TYPES = [
  { value: "design", label: "Design", icon: "PenTool", color: "#7C3AED" },
  { value: "illustration", label: "Illustration", icon: "Brush", color: "#3B82F6" },
  { value: "photo", label: "Photo Edit", icon: "Image", color: "#22C55E" },
  { value: "video", label: "Video Edit", icon: "Video", color: "#F59E0B" },
  { value: "animation", label: "Animation", icon: "Sparkles", color: "#EC4899" },
] as const;

export const ASSET_TYPES = [
  { value: "image", label: "Images", icon: "Image" },
  { value: "icon", label: "Icons", icon: "Shapes" },
  { value: "font", label: "Fonts", icon: "Type" },
  { value: "sticker", label: "Stickers", icon: "Sticker" },
  { value: "shape", label: "Shapes", icon: "Square" },
  { value: "template", label: "Templates", icon: "LayoutTemplate" },
] as const;

export const TICKET_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical" },
  { value: "account", label: "Account" },
  { value: "bug", label: "Bug Report" },
] as const;

export const TICKET_PRIORITIES = [
  { value: "low", label: "Low", color: "#22C55E" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#FB923C" },
  { value: "urgent", label: "Urgent", color: "#EF4444" },
] as const;

export const NOTIFICATION_GROUPS = [
  { value: "system", label: "System", color: "#3B82F6" },
  { value: "subscription", label: "Subscription", color: "#7C3AED" },
  { value: "security", label: "Security", color: "#EF4444" },
  { value: "announcement", label: "Announcements", color: "#F59E0B" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
] as const;

export function getProjectTypeMeta(type: string) {
  return PROJECT_TYPES.find((t) => t.value === type) ?? PROJECT_TYPES[0];
}

export function getTicketPriorityMeta(priority: string) {
  return TICKET_PRIORITIES.find((p) => p.value === priority) ?? TICKET_PRIORITIES[1];
}

export function getTicketCategoryMeta(category: string) {
  return TICKET_CATEGORIES.find((c) => c.value === category) ?? TICKET_CATEGORIES[0];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatMb(mb: number): string {
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
