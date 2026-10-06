import type { Metadata } from "next";
import { Landing } from "../components/Landing";
import { siteUrl } from "../lib/site";
export const metadata: Metadata = {
  title: "Teramis — CUI discovery from environment to file",
  description:
    "Discover potential CUI, validate your documented boundary, remediate approved findings, and monitor changes over time.",
  alternates: { canonical: siteUrl("/") },
  openGraph: {
    type: "website",
    siteName: "Teramis",
    title: "Mission-critical data. Total visibility.",
    description:
      "Discovery, validation, approved remediation, and recurring monitoring.",
    url: siteUrl("/"),
    images: [
      {
        url: siteUrl("/opengraph-image.jpg"),
        width: 1200,
        height: 630,
        alt: "Teramis — CUI discovery, validation, remediation and monitoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mission-critical data. Total visibility.",
    images: [siteUrl("/opengraph-image.jpg")],
  },
};
export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Teramis", url: "https://teramis.us/" },
      {
        "@type": "SoftwareApplication",
        name: "Teramis",
        applicationCategory: "SecurityApplication",
        description: "CUI discovery, validation, remediation and monitoring.",
        publisher: { "@type": "Organization", name: "Teramis" },
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Landing />
    </>
  );
}
