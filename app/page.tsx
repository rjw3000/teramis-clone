import type { Metadata } from "next";
import { Landing } from "../components/Landing";

const title = "Teramis — CUI discovery from environment to file";
const description = "Find where CUI actually lives, validate your CUI boundary, and monitor for spillage. Evidence to support DFARS safeguarding and SPRS self-assessments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://termamis.awesome/" },
  openGraph: {
    type: "website",
    siteName: "Teramis",
    title: "Teramis — Know Where Your CUI Actually Lives",
    description: "Discovery, validation, remediation, and ongoing monitoring of CUI, ITAR, and other covered defense information.",
    url: "https://termamis.awesome/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teramis — Know Where Your CUI Actually Lives",
    description: "Find where CUI actually lives, validate your CUI boundary, and monitor for spillage.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "Teramis", url: "https://teramis.us/" },
    {
      "@type": "SoftwareApplication",
      name: "Teramis",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
      description: "CUI discovery, boundary validation, remediation, and ongoing monitoring for Defense Industrial Base organizations.",
      publisher: { "@type": "Organization", name: "Teramis" },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing />
    </>
  );
}
