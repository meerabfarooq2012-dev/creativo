import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Cookie Policy — Creativo",
  description:
    "How Creativo uses cookies and similar technologies when you visit or use our platform.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="June 2026"
      intro="This Cookie Policy explains how Creativo uses cookies and similar technologies when you visit or use our platform."
      sections={[
        {
          id: "what-are-cookies",
          title: "What Are Cookies?",
          items: [
            "Cookies are small text files stored on your device when you visit a website.",
            "They help websites remember information such as:",
            [
              "Login sessions",
              "Preferences",
              "Language settings",
              "Security information",
              "Usage analytics",
            ],
          ],
        },
        {
          id: "how-creativo-uses-cookies",
          title: "How Creativo Uses Cookies",
          items: [
            "Creativo uses cookies to:",
            "Essential Cookies — These cookies are necessary for the platform to function. Examples:",
            [
              "User authentication",
              "Login sessions",
              "Security verification",
              "Account access",
            ],
            "Without these cookies, some services may not work properly.",
            "Preference Cookies — These cookies remember user settings such as:",
            [
              "Theme preferences",
              "Language preferences",
              "Dashboard settings",
              "Workspace preferences",
            ],
            "Analytics Cookies — These cookies help us understand:",
            [
              "How users interact with the platform",
              "Popular features",
              "Performance issues",
              "Usage trends",
            ],
            "This information helps improve Creativo.",
            "Security Cookies — These cookies help:",
            [
              "Detect suspicious activity",
              "Prevent unauthorized access",
              "Protect user accounts",
              "Improve platform security",
            ],
          ],
        },
        {
          id: "third-party-cookies",
          title: "Third-Party Cookies",
          items: [
            "Creativo may use trusted third-party services that place cookies for:",
            [
              "Authentication",
              "Analytics",
              "Hosting",
              "Performance monitoring",
            ],
            "These services operate under their own privacy policies.",
          ],
        },
        {
          id: "managing-cookies",
          title: "Managing Cookies",
          items: [
            "Most web browsers allow users to:",
            [
              "View cookies",
              "Delete cookies",
              "Block cookies",
              "Manage cookie preferences",
            ],
            "Disabling certain cookies may affect platform functionality.",
          ],
        },
        {
          id: "cookie-retention",
          title: "Cookie Retention",
          items: [
            "Some cookies are temporary and expire when you close your browser.",
            "Others may remain for a longer period to remember your preferences and settings.",
          ],
        },
        {
          id: "changes-to-this-policy",
          title: "Changes to This Policy",
          items: [
            "Creativo may update this Cookie Policy from time to time.",
            "Any significant changes will be communicated through the platform.",
          ],
        },
      ]}
    />
  );
}
