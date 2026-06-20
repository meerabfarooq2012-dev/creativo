import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — Creativo",
  description:
    "The terms and conditions that govern your use of the Creativo platform.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="June 2026"
      intro="Welcome to Creativo. By creating an account or using our platform, you agree to these Terms of Service. Please read them carefully."
      sections={[
        {
          id: "acceptance-of-terms",
          title: "Acceptance of Terms",
          items: [
            "By accessing or using Creativo, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use the platform.",
          ],
        },
        {
          id: "your-account",
          title: "Your Account",
          items: [
            "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
            [
              "You must provide accurate information at registration.",
              "You must be legally able to use online services in your region.",
              "You must not share your account or allow unauthorized access.",
              "You must notify us immediately of any unauthorized use.",
            ],
          ],
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          items: [
            "You agree not to use Creativo to:",
            [
              "Violate any law or regulation",
              "Infringe the intellectual property rights of others",
              "Upload malicious code or harmful content",
              "Harass, abuse, or harm other users",
              "Attempt to disrupt or compromise platform security",
              "Use the platform to send spam or unauthorized communications",
            ],
          ],
        },
        {
          id: "user-content",
          title: "User Content",
          items: [
            "You retain ownership of all content you create on Creativo. By uploading or creating content, you grant us a limited license to host, store, and display it as needed to provide the service.",
            "You are solely responsible for your content and must ensure you have the rights to use any assets you upload.",
          ],
        },
        {
          id: "plans-and-trials",
          title: "Plans, Trials, and Billing",
          items: [
            "Creativo offers Free, Student, Pro, and Team plans. Paid plans are optional — the Free plan is available at no cost.",
            [
              "Free trials are optional and must be started manually by the user.",
              "Trials provide 30 days of Pro features at no charge.",
              "When billing launches, paid plans will renew automatically until canceled.",
              "You can cancel a subscription or trial at any time from your account settings.",
            ],
          ],
        },
        {
          id: "intellectual-property",
          title: "Intellectual Property",
          items: [
            "Creativo, its logo, templates, and platform code are the property of Creativo and protected by intellectual property laws. You may not copy, modify, or redistribute them without permission.",
          ],
        },
        {
          id: "termination",
          title: "Termination",
          items: [
            "You may delete your account at any time. We may suspend or terminate accounts that violate these Terms or pose a risk to the platform or its users.",
          ],
        },
        {
          id: "disclaimer",
          title: "Disclaimer",
          items: [
            "Creativo is provided \u201Cas is\u201D without warranties of any kind. We do not guarantee uninterrupted or error-free service.",
          ],
        },
        {
          id: "limitation-of-liability",
          title: "Limitation of Liability",
          items: [
            "To the maximum extent permitted by law, Creativo shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
          ],
        },
        {
          id: "changes-to-terms",
          title: "Changes to These Terms",
          items: [
            "We may update these Terms from time to time. Users will be notified of significant changes through the platform. Continued use after changes take effect constitutes acceptance.",
          ],
        },
      ]}
    />
  );
}
