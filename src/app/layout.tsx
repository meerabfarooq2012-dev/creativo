import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://creativo.app";
const SITE_DESCRIPTION =
  "Creativo is a free creative studio for designers, illustrators, and professionals. Design with layers, animate, edit, and manage projects — drag-and-drop templates plus a full professional toolset, right in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Creativo — Create Without Limits | Free Design, Animation & Editing Studio",
    template: "%s | Creativo",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Creativo",
  keywords: [
    "Creativo",
    "creative studio",
    "free design tool",
    "online design platform",
    "layers editor",
    "drag and drop design",
    "illustration tool",
    "animation software",
    "video editing",
    "photo editing",
    "graphic design",
    "design templates",
    "creative tools",
    "SaaS design platform",
    "design without limits",
  ],
  authors: [{ name: "Creativo" }],
  creator: "Creativo",
  publisher: "Creativo",
  category: "Design",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Creativo",
    title: "Creativo — Create Without Limits | Free Design, Animation & Editing Studio",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.svg",
        width: 48,
        height: 48,
        alt: "Creativo logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creativo — Create Without Limits",
    description:
      "Free creative studio with layers, animation, editing & drag-and-drop templates. Design professionally in your browser.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Creativo",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available forever. Paid plans from $4/month.",
  },
  featureList: [
    "Layer-based design editor",
    "Drag-and-drop templates",
    "Illustration tools",
    "Animation",
    "Video editing",
    "Photo editing",
    "Cloud storage",
    "Team collaboration",
  ],
  publisher: {
    "@type": "Organization",
    name: "Creativo",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <SonnerToaster
                position="top-right"
                theme="dark"
                toastOptions={{
                  style: {
                    background: "#1E293B",
                    border: "1px solid #334155",
                    color: "#FFFFFF",
                  },
                }}
              />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
