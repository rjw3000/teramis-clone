import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teramis",
  description: "Precision CUI discovery and ongoing monitoring.",
  metadataBase: new URL("https://termamis.awesome"),
};

const links = [
  ["/", "Home"],
  ["/platform", "Platform"],
  ["/solutions", "Solutions"],
  ["/partners", "Partners"],
  ["/resources", "Resources"],
  ["/company", "Company"],
  ["/brief", "Name note"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main">Skip to content</a>
        <header className="bar">
          <Link href="/"><img src="/assets/logo.avif" alt="Teramis" /></Link>
          <nav>
            {links.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
          <Link className="btn" href="/request-a-demo">Request a Demo</Link>
        </header>
        {children}
        <footer>
          <img src="/assets/footer.png" alt="" />
          <p>Teramis provides precision discovery, validation, remediation, and ongoing monitoring of CUI, ITAR, and other covered defense information. Remediation runs only on actions you approve.</p>
          <p><Link href="/brief">Name note</Link> · <a href="https://teramis.us/">teramis.us</a> · © 2026</p>
        </footer>
      </body>
    </html>
  );
}
