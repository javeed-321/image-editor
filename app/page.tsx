import type { Metadata } from "next";
import { Editor } from "@/components/editor/editor";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Edit Text on Screenshot — Free Online Screenshot Editor",
  },
  description:
    "Edit and annotate text on screenshots effortlessly online. Upload a PNG, JPG, GIF, or WebP and start editing instantly — no signup required.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Edit Text on Screenshot — Free Online Screenshot Editor",
    description:
      "Upload a screenshot and edit or annotate the text in seconds. Free, browser-based, no signup.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edit Text on Screenshot — Free Online Screenshot Editor",
    description:
      "Upload a screenshot and edit or annotate the text in seconds. Free, browser-based, no signup.",
  },
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ImageEditor",
  url: siteUrl,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Image Editor",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript and a modern browser (Chrome, Firefox, Safari, Edge).",
  description:
    "Free browser-based screenshot editor. Edit, annotate, and erase text on screenshots — no signup, no install.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Edit text on screenshots",
    "Annotate images",
    "Crop and rotate",
    "Upload from device or URL",
    "Supports PNG, JPG, GIF, WebP",
    "No signup required",
  ],
  isAccessibleForFree: true,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ],
};

export default function Home() {
  return (
    <section className="flex flex-1 flex-col">
      <JsonLd data={webApplicationSchema} />
      <JsonLd data={breadcrumbSchema} />
       
      <Editor />
    </section>
  );
}
