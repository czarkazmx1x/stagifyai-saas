import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StagifyAI - AI-Powered Virtual Staging",
  description: "Professional virtual staging for real estate agents. Transform empty rooms into stunning homes with AI-powered technology.",
  keywords: ["virtual staging", "real estate", "AI", "property staging", "StagifyAI", "real estate photography"],
  authors: [{ name: "StagifyAI Team" }],
  openGraph: {
    title: "StagifyAI - AI-Powered Virtual Staging",
    description: "Transform empty rooms into stunning homes with AI-powered virtual staging technology.",
    url: "https://stagifyai.com",
    siteName: "StagifyAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StagifyAI - AI-Powered Virtual Staging",
    description: "Transform empty rooms into stunning homes with AI-powered virtual staging technology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
