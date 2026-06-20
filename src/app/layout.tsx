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

export const metadata: Metadata = {
  title: "Creativo — Create Without Limits",
  description:
    "Creativo is a modern Creative Studio platform for designers, illustrators, creators, and professionals. Create designs, illustrations, edit content, and manage creative projects.",
  keywords: [
    "Creativo",
    "Creative Studio",
    "Design Platform",
    "Illustration",
    "Photo Editing",
    "SaaS",
    "Creative Tools",
  ],
  authors: [{ name: "Creativo" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Creativo — Create Without Limits",
    description:
      "A modern Creative Studio platform for designers, illustrators, and creators.",
    siteName: "Creativo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creativo — Create Without Limits",
    description:
      "A modern Creative Studio platform for designers, illustrators, and creators.",
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
