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
      intro="Welcome to Creativo. By accessing or using Creativo, you agree to these Terms of Service. If you do not agree with these terms, please do not use our platform."
      sections={[
        {
          id: "acceptance-of-terms",
          title: "Acceptance of Terms",
          items: [
            "By creating an account or using Creativo, you agree to comply with these Terms of Service, our Privacy Policy, and all applicable laws and regulations.",
          ],
        },
        {
          id: "about-creativo",
          title: "About Creativo",
          items: [
            "Creativo is an online creative platform that provides design, illustration, editing, animation, and project management tools for creators, students, freelancers, and professionals.",
          ],
        },
        {
          id: "user-accounts",
          title: "User Accounts",
          items: [
            "To access certain features, you may be required to create an account.",
            "You agree to:",
            [
              "Provide accurate information",
              "Keep your account secure",
              "Maintain password confidentiality",
              "Notify us of unauthorized account access",
            ],
            "You are responsible for all activity under your account.",
          ],
        },
        {
          id: "user-content",
          title: "User Content",
          items: [
            "Users retain ownership of all original content they create and upload to Creativo, including:",
            [
              "Designs",
              "Illustrations",
              "Images",
              "Videos",
              "Animations",
              "Projects",
            ],
            "Creativo does not claim ownership of user-created content.",
            "However, you grant Creativo permission to store, process, and display your content as necessary to provide the service.",
          ],
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          items: [
            "Users may not:",
            [
              "Upload illegal content",
              "Violate intellectual property rights",
              "Spread malware or harmful code",
              "Attempt unauthorized access to systems",
              "Abuse platform resources",
              "Harass or harm other users",
              "Use Creativo for fraudulent activities",
            ],
            "Violation of these rules may result in account suspension or termination.",
          ],
        },
        {
          id: "intellectual-property",
          title: "Intellectual Property",
          items: [
            "All Creativo branding, software, logos, designs, trademarks, and platform content belong to Creativo unless otherwise stated.",
            "Users may not copy, distribute, reverse engineer, or reproduce platform software without permission.",
          ],
        },
        {
          id: "subscriptions",
          title: "Subscriptions",
          items: [
            "Creativo may offer:",
            [
              "Free Plan",
              "Student Plan",
              "Pro Plan",
              "Team Plan",
            ],
            "Subscription benefits and pricing may change over time.",
            "Users will be informed of significant pricing changes before renewal where applicable.",
          ],
        },
        {
          id: "free-trial",
          title: "Free Trial",
          items: [
            "Creativo may provide a free trial period.",
            "Free trials:",
            [
              "Must be activated manually by the user",
              "Are limited to one trial per eligible account",
              "May be modified or discontinued at our discretion",
            ],
          ],
        },
        {
          id: "payments-and-refunds",
          title: "Payments and Refunds",
          items: [
            "Paid subscriptions provide access to premium features.",
            "Unless required by law:",
            [
              "Subscription fees are non-refundable",
              "Users may cancel future renewals at any time",
              "Access remains active until the subscription period ends",
            ],
          ],
        },
        {
          id: "storage-and-data",
          title: "Storage and Data",
          items: [
            "Creativo provides cloud storage for projects and assets.",
            "Users are responsible for maintaining backups of important content.",
            "We may apply storage limits according to subscription plans.",
          ],
        },
        {
          id: "account-suspension",
          title: "Account Suspension",
          items: [
            "Creativo reserves the right to:",
            [
              "Suspend accounts",
              "Restrict access",
              "Remove content",
              "Terminate accounts",
            ],
            "if users violate these Terms or engage in harmful activities.",
          ],
        },
        {
          id: "service-availability",
          title: "Service Availability",
          items: [
            "We aim to provide reliable services, but we do not guarantee uninterrupted access.",
            "Temporary interruptions may occur due to:",
            [
              "Maintenance",
              "Updates",
              "Technical issues",
              "Security measures",
            ],
          ],
        },
        {
          id: "limitation-of-liability",
          title: "Limitation of Liability",
          items: [
            "To the maximum extent permitted by law, Creativo shall not be liable for:",
            [
              "Data loss",
              "Business interruption",
              "Indirect damages",
              "Lost profits",
              "Third-party actions",
            ],
            "Users use the platform at their own risk.",
          ],
        },
        {
          id: "privacy",
          title: "Privacy",
          items: [
            "Use of Creativo is also governed by our Privacy Policy.",
            "By using the platform, you acknowledge that you have read and understood our Privacy Policy.",
          ],
        },
        {
          id: "modifications",
          title: "Modifications",
          items: [
            "Creativo may update these Terms of Service from time to time.",
            "Continued use of the platform after updates means acceptance of the revised Terms.",
          ],
        },
        {
          id: "termination",
          title: "Termination",
          items: [
            "Users may stop using Creativo at any time.",
            "Creativo may terminate accounts that violate these Terms or create security risks for the platform or community.",
          ],
        },
        {
          id: "governing-law",
          title: "Governing Law",
          items: [
            "These Terms shall be governed by applicable laws and regulations in the jurisdiction where Creativo operates.",
          ],
        },
      ]}
    />
  );
}
