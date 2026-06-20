// Creativo - Plans & Pricing

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
    description: "Perfect for getting started with creative work",
    priceMonthly: 0,
    priceYearly: 0,
    storageLimitMb: 500,
    features: [
      "5 Projects",
      "500 MB Storage",
      "Basic Templates",
      "Community Support",
      "PNG / JPG Export",
      "Mobile App Access",
    ],
    isPopular: false,
    cta: "Start Free",
  },
  {
    id: "student",
    name: "STUDENT",
    displayName: "Student",
    description: "Discounted plan for students and learners",
    priceMonthly: 4,
    priceYearly: 40,
    storageLimitMb: 5000,
    features: [
      "Unlimited Projects",
      "5 GB Storage",
      "Premium Templates",
      "Priority Email Support",
      "SVG / PDF Export",
      "No Watermarks",
      "Valid .edu email required",
    ],
    isPopular: false,
    cta: "Get Student Plan",
  },
  {
    id: "pro",
    name: "PRO",
    displayName: "Pro",
    description: "Advanced tools for professional creators",
    priceMonthly: 12,
    priceYearly: 120,
    storageLimitMb: 50000,
    features: [
      "Unlimited Projects",
      "50 GB Storage",
      "All Premium Templates",
      "Priority Support",
      "All Export Formats",
      "Version History",
      "Custom Branding",
      "AI Assistant",
      "Advanced Collaboration",
    ],
    isPopular: true,
    cta: "Start Pro Trial",
  },
  {
    id: "team",
    name: "TEAM",
    displayName: "Team",
    description: "Built for teams and growing studios",
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
