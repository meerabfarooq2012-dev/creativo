import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Creativo",
  description:
    "How Creativo collects, uses, stores, and protects your information when you use our platform.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="June 2026"
      intro="Welcome to Creativo. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use Creativo."
      sections={[
        {
          id: "information-we-collect",
          title: "Information We Collect",
          items: [
            "When you use Creativo, we may collect:",
            [
              "Account Information — Name, Email Address, Username, Profile Information",
              "Project Information — Designs, Illustrations, Uploaded Files, Saved Projects, Assets and Templates",
              "Technical Information — Device Information, Browser Type, IP Address, Login Activity, Usage Analytics",
            ],
          ],
        },
        {
          id: "how-we-use",
          title: "How We Use Your Information",
          items: [
            "We use collected information to:",
            [
              "Create and manage accounts",
              "Save user projects",
              "Provide cloud storage",
              "Improve platform performance",
              "Provide customer support",
              "Enhance security",
              "Prevent abuse and fraud",
              "Communicate important updates",
            ],
          ],
        },
        {
          id: "user-content-ownership",
          title: "User Content Ownership",
          items: [
            "All original designs, illustrations, projects, and creative content created by users remain the property of their respective creators.",
            "Creativo does not claim ownership of user-created content.",
          ],
        },
        {
          id: "data-storage",
          title: "Data Storage",
          items: [
            "User data may be stored securely using trusted cloud infrastructure providers.",
            "We implement reasonable security measures to protect stored information.",
          ],
        },
        {
          id: "sharing-information",
          title: "Sharing Information",
          items: [
            "We do not sell personal information.",
            "Information may only be shared:",
            [
              "When required by law",
              "To protect platform security",
              "With trusted service providers that help operate Creativo",
            ],
          ],
        },
        {
          id: "account-security",
          title: "Account Security",
          items: [
            "Users are responsible for:",
            [
              "Protecting account credentials",
              "Maintaining password confidentiality",
              "Reporting unauthorized access",
            ],
          ],
        },
        {
          id: "cookies",
          title: "Cookies",
          items: [
            "Creativo may use cookies and similar technologies to:",
            [
              "Maintain user sessions",
              "Improve performance",
              "Remember preferences",
              "Analyze platform usage",
            ],
          ],
        },
        {
          id: "childrens-privacy",
          title: "Children\u2019s Privacy",
          items: [
            "Creativo is intended for users who can legally use online services in their region.",
            "If we become aware that personal information has been collected improperly from a child where parental consent is required, we may remove such information.",
          ],
        },
        {
          id: "data-retention",
          title: "Data Retention",
          items: [
            "We retain information only as long as necessary to:",
            [
              "Provide services",
              "Maintain accounts",
              "Comply with legal obligations",
              "Resolve disputes",
            ],
            "Users may request account deletion where applicable.",
          ],
        },
        {
          id: "account-deletion",
          title: "Account Deletion",
          items: [
            "Users may request deletion of their account and associated personal information.",
            "Some information may be retained where required for security, legal, or operational reasons.",
          ],
        },
        {
          id: "changes",
          title: "Changes to This Policy",
          items: [
            "We may update this Privacy Policy from time to time.",
            "Users will be notified of significant changes through the platform.",
          ],
        },
      ]}
    />
  );
}
