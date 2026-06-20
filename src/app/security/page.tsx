import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Security Policy — Creativo",
  description:
    "How Creativo protects user information and maintains a safe creative environment.",
};

export default function SecurityPage() {
  return (
    <LegalLayout
      title="Security Policy"
      lastUpdated="June 2026"
      intro="At Creativo, the security of our users, projects, and data is a top priority. We are committed to protecting user information and maintaining a safe creative environment."
      sections={[
        {
          id: "account-security",
          title: "Account Security",
          items: [
            "Users are responsible for:",
            [
              "Using strong passwords",
              "Keeping login credentials confidential",
              "Logging out from shared devices",
              "Reporting suspicious activity immediately",
            ],
            "Creativo is not responsible for losses caused by unauthorized access resulting from weak or shared passwords.",
          ],
        },
        {
          id: "data-protection",
          title: "Data Protection",
          items: [
            "We implement industry-standard security measures to protect user information, including:",
            [
              "Encrypted connections (HTTPS/SSL)",
              "Secure authentication systems",
              "Access controls",
              "Database security protections",
              "Secure cloud infrastructure",
            ],
          ],
        },
        {
          id: "password-security",
          title: "Password Security",
          items: [
            "Passwords are encrypted and securely stored.",
            "Creativo employees and administrators cannot view user passwords.",
          ],
        },
        {
          id: "secure-storage",
          title: "Secure Storage",
          items: [
            "User projects, assets, and uploaded files are stored using secure cloud infrastructure.",
            "Access to stored data is restricted to authorized systems and services.",
          ],
        },
        {
          id: "monitoring-and-threat-prevention",
          title: "Monitoring and Threat Prevention",
          items: [
            "To protect the platform, Creativo may:",
            [
              "Monitor suspicious login activity",
              "Detect abuse and fraud",
              "Prevent spam and automated attacks",
              "Block malicious behavior",
            ],
            "Accounts involved in harmful activity may be suspended or terminated.",
          ],
        },
        {
          id: "unauthorized-access",
          title: "Unauthorized Access",
          items: [
            "Users may not:",
            [
              "Attempt to gain unauthorized access",
              "Bypass security controls",
              "Access accounts belonging to others",
              "Exploit vulnerabilities",
              "Interfere with platform operations",
            ],
            "Such activities may result in immediate account termination.",
          ],
        },
        {
          id: "reporting-security-issues",
          title: "Reporting Security Issues",
          items: [
            "If you discover a security vulnerability, please report it responsibly.",
            "Contact:",
            [
              "security@creativo.com",
            ],
            "Please do not publicly disclose vulnerabilities until they have been reviewed and addressed.",
          ],
        },
        {
          id: "third-party-services",
          title: "Third-Party Services",
          items: [
            "Creativo may use trusted third-party providers for services such as:",
            [
              "Authentication",
              "Hosting",
              "Cloud Storage",
              "Analytics",
            ],
            "While we choose providers carefully, their services are governed by their own security practices and policies.",
          ],
        },
        {
          id: "user-responsibilities",
          title: "User Responsibilities",
          items: [
            "Users should:",
            [
              "Keep software and browsers updated",
              "Use secure internet connections",
              "Avoid sharing account credentials",
              "Review account activity regularly",
            ],
          ],
        },
        {
          id: "data-breach-response",
          title: "Data Breach Response",
          items: [
            "In the event of a significant security incident, Creativo will:",
            [
              "Investigate the issue",
              "Secure affected systems",
              "Notify affected users when required",
              "Take corrective action to prevent recurrence",
            ],
          ],
        },
        {
          id: "security-updates",
          title: "Security Updates",
          items: [
            "Creativo continuously reviews and improves security measures.",
            "Security practices may be updated as technology and threats evolve.",
          ],
        },
      ]}
    />
  );
}
