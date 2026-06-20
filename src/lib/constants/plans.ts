// Creativo - Plans & Pricing
//
// Positioning:
// - Free        → drag-and-drop templates only (free + premium templates), no layers
// - Student     → pick 3 professional tools (from design, illustration, photo editing,
//                 video editing, animation) + cloud storage
// - Pro         → all professional tools unlocked
// - Team        → all professional tools + team collaboration

export interface PlanInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  storageLimitMb: number;
  features: string[];
  isPopular: boolean;
  cta: string;
}

export const PROFESSIONAL_TOOLS = [
  "Design",
  "Illustration",
  "Photo Editing",
  "Video Editing",
  "Animation",
] as const;

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "FREE",
    displayName: "Free",
    description: "Drag-and-drop templates — free forever, no layers.",
    priceMonthly: 0,
    priceYearly: 0,
    storageLimitMb: 500,
    features: [
      "Drag-and-drop editor",
      "Free templates",
      "Premium templates (preview only)",
      "5 Projects",
      "500 MB Storage",
      "PNG / JPG Export",
      "Community Support",
    ],
    isPopular: false,
    cta: "Start Free",
  },
  {
    id: "student",
    name: "STUDENT",
    displayName: "Student",
    description:
      "Pick 3 professional tools + cloud storage at a student price.",
    priceMonthly: 4,
    priceYearly: 40,
    storageLimitMb: 5000,
    features: [
      "Everything in Free",
      "Choose any 3 professional tools:",
      "  Design · Illustration · Photo Editing",
      "  Video Editing · Animation",
      "Layer-based editor (for chosen tools)",
      "Premium templates (full access)",
      "5 GB Cloud Storage",
      "Unlimited Projects",
      "SVG / PDF Export",
      "No Watermarks",
      "Priority Email Support",
      "Valid .edu email required",
    ],
    isPopular: false,
    cta: "Get Student Plan",
  },
  {
    id: "pro",
    name: "PRO",
    displayName: "Pro",
    description: "All professional tools unlocked for serious creators.",
    priceMonthly: 12,
    priceYearly: 120,
    storageLimitMb: 50000,
    features: [
      "Everything in Student",
      "All 5 professional tools unlocked:",
      "  Design · Illustration · Photo Editing",
      "  Video Editing · Animation",
      "Full layer-based editor",
      "All premium templates",
      "50 GB Cloud Storage",
      "All Export Formats",
      "Version History",
      "Custom Branding",
      "Advanced Collaboration",
    ],
    isPopular: true,
    cta: "Start Pro Trial",
  },
  {
    id: "team",
    name: "TEAM",
    displayName: "Team",
    description:
      "All professional tools + collaboration for teams & studios.",
    priceMonthly: 29,
    priceYearly: 290,
    storageLimitMb: 500000,
    features: [
      "Everything in Pro",
      "500 GB Cloud Storage",
      "Up to 25 Team Members",
      "Shared Asset Library",
      "Admin Console",
      "Advanced Permissions",
      "Audit Logs",
      "Priority Phone Support",
      "SLA Guarantee",
    ],
    isPopular: false,
    cta: "Start Team Trial",
  },
];

export const TRIAL_DURATION_DAYS = 30;

export function getPlanByName(name: string): PlanInfo | undefined {
  return PLANS.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price}`;
}
