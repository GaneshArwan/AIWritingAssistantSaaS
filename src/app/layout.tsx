import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "AI Writer SaaS | Premium Content Generation",
  description: "Generate high-converting blog posts, marketing emails, social media updates, and product descriptions instantly with our advanced AI writing assistant.",
  keywords: ["AI writing assistant", "content generator", "AI copywriter", "marketing automation", "blog writer AI", "SaaS"],
  authors: [{ name: "AI Writer Team" }],
  openGraph: {
    title: "AI Writer SaaS | Premium Content Generation",
    description: "Generate high-converting content instantly with our advanced AI writing assistant.",
    url: "https://aiwriter.app",
    siteName: "AI Writer SaaS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Writer SaaS Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Writer SaaS | Premium Content Generation",
    description: "Generate high-converting content instantly with our advanced AI.",
    creator: "@aiwritersaas",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
