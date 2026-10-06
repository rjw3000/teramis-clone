import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "../lib/site";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { CookieNotice } from "../components/CookieNotice";

export const metadata: Metadata = {
  title: "Teramis",
  description: "Precision CUI discovery and ongoing monitoring.",
  metadataBase: new URL(SITE_URL),
};

export const viewport: Viewport = { themeColor: "#07111a" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CookieNotice />
      </body>
    </html>
  );
}
