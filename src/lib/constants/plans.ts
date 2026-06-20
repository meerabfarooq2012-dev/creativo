// Creativo - Plans & Pricing
//
// Positioning:
// - Free        → full editor with layers + drag-and-drop templates (free core)
// - Student     → half-professional: pro tools at a student price
// - Pro         → full professional toolset
// - Team        → full professional + team collaboration

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

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "FREE",
    displayName: "Free",
    description: "Layer-based editor + drag-and-drop templates — free forever.",
    priceMonthly: 0,
    priceYearly: 0,
    storageLimitMb: 500,
    features: [
      "Layer-based design editor",
      "Drag-and-drop templates",
      "Basic illustration & editing tools",
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
      "Half-professional: pro tools like layers at a student price.",
    priceMonthly: 4,
    priceYearly: 40,
    storageLimitMb: 5000,
    features: [
      "Everything in Free",
      "Pro tools: layers & advanced editor",
      "Premium templates",
      "Unlimited Projects",
      "5 GB Storage",
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
    description: "Full professional toolset for serious creators.",
    priceMonthly: 12,
    priceYearly: 120,
    storageLimitMb: 50000,
    features: [
      "Everything in Student",
      "Full professional toolset",
      "All premium templates",
      "50 GB Storage",
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
    description: "Full professional + collaboration for teams & studios.",
    priceMonthly: 29,
    priceYearly: 290,
    storageLimitMb: 500000,
    features: [
      "Everything in Pro",
      "500 GB Storage",
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
