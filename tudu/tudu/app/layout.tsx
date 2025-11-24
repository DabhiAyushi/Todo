import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNavbar } from "@/components/ui/bottom-navbar";
import TopLogo from "@/components/ui/top-logo";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tudu.app"),
  title: {
    default: "Tudu - Smart Todo Management with AI",
    template: "%s | Tudu",
  },
  description:
    "Manage your tasks effortlessly with AI-powered smart parsing. Add todos using natural language, track progress with analytics, and boost your productivity.",
  keywords: [
    "todo app",
    "task manager",
    "AI todo parser",
    "productivity",
    "task tracking",
    "smart todos",
    "checklist",
    "reminders",
    "natural language",
  ],
  authors: [{ name: "Tudu" }],
  creator: "Tudu",
  publisher: "Tudu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tudu.app",
    title: "Tudu - Smart Todo Management with AI",
    description:
      "Manage your tasks effortlessly with AI-powered smart parsing. Track progress with analytics and boost your productivity.",
    siteName: "Tudu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tudu - Smart Todo Management with AI",
    description:
      "Manage your tasks effortlessly with AI-powered smart parsing. Track progress with analytics and boost your productivity.",
    creator: "@tudu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <TopLogo />
          <div className="max-w-4xl mx-auto px-3 pt-20 pb-30"> {children}</div>
          <BottomNavbar />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
