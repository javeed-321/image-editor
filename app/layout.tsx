import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PromoBadge } from "@/components/promo-badge";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/site";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "-apple-system", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ImageEditor — Edit Text on Screenshots Online",
    template: "%s | ImageEditor",
  },
  description:
    "Free online screenshot editor. Edit, annotate, and erase text on screenshots in your browser — no signup, no install.",
  applicationName: "ImageEditor",
  keywords: [
    "screenshot editor",
    "edit text on screenshot",
    "annotate screenshots",
    "online image editor",
    "image annotation",
    "remove text from screenshot",
    "screenshot markup tool",
    "Free Screenshot Editor | No Signup & No Ads",
    "Add Background to Screenshots"
  ],
  category: "productivity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "ImageEditor",
    title: "ImageEditor — Edit Text on Screenshots Online",
    description:
      "Edit and annotate text on screenshots effortlessly online. Free, browser-based, no signup.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageEditor — Edit Text on Screenshots Online",
    description:
      "Edit and annotate text on screenshots effortlessly online. Free, browser-based, no signup.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ImageEditor",
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ImageEditor",
  url: siteUrl,
  inLanguage: "en-US",
  publisher: {
    "@type": "Organization",
    name: "ImageEditor",
    url: siteUrl,
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden bg-background">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <PromoBadge />
        <Toaster position="top-center" richColors />   {/* ← new */}

      </body>
    </html>
  );
}
