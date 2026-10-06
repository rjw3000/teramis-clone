import Link from "next/link";
import { CookieButton } from "./CookieNotice";
import { Mail } from "./icons";

const columns: [string, [string, string][]][] = [
  [
    "Platform",
    [
      ["CUI Discovery", "/platform/cui-discovery"],
      ["Evidence and validation", "/platform/evidence-validation"],
      ["Ongoing monitoring", "/platform/ongoing-cui-monitoring"],
      ["Remediation", "/platform/remediation"],
      ["Deployment and data sources", "/platform/deployment-and-data-sources"],
    ],
  ],
  [
    "Solutions",
    [
      ["CMMC scoping", "/solutions/cmmc-scoping"],
      ["CUI boundary validation", "/solutions/cui-boundary-validation"],
      ["Migration support", "/solutions/migration-support"],
      ["Supply chain and M&A", "/solutions/supply-chain-ma"],
      ["Government agencies", "/solutions/government-agencies"],
    ],
  ],
  [
    "Company",
    [
      ["About", "/company/about"],
      ["Why Teramis", "/company/why-teramis"],
      ["Partners", "/partners"],
      ["Blog", "/teramis-blog"],
      ["Careers", "/company/careers"],
    ],
  ],
  [
    "Contact",
    [
      ["Contact us", "/contact-us"],
      ["Request a Demo", "/request-a-demo"],
      ["Readiness assessment", "/cui-discovery-readiness-assessment-teramis"],
      ["FAQs", "/resources/faqs"],
    ],
  ],
];

const seo: [string, string][] = [
  ["CUI discovery software", "/platform/cui-discovery"],
  ["CMMC Level 2 scoping", "/solutions/cmmc-scoping"],
  ["CUI boundary validation", "/solutions/cui-boundary-validation"],
  ["CUI spillage monitoring", "/solutions/cui-remediation-spillage-monitoring"],
  [
    "Post-incident CUI scoping",
    "/solutions/post-incident-cui-scoping-and-discovery-teramis",
  ],
  ["CUI for small business", "/solutions/by-organization/small-business"],
];

export function SiteFooter() {
  return (
    <footer id="footer" className="ftr">
      <div className="wrap ftr-in">
        <div className="ftr-grid">
          <div className="ftr-brand">
            <img
              src="/assets/logo.avif"
              alt="Teramis"
              width={130}
              height={40}
              loading="lazy"
              decoding="async"
            />
            <p>
              Precision discovery, validation, remediation, and ongoing
              monitoring of CUI, ITAR, and other covered defense information.
              Remediation runs only on actions you approve.
            </p>
            <div className="row-gap">
              <Link
                href="/contact-us"
                aria-label="Contact Teramis"
                className="icon-btn ftr-social"
              >
                <Mail />
              </Link>
            </div>
          </div>
          {columns.map(([title, links]) => (
            <nav key={title} aria-label={title} className="ftr-col">
              <span className="mono-label">{title.toUpperCase()}</span>
              {links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="ftr-seo">
          {seo.map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="ftr-legal">
          <span>© 2026 Teramis. All rights reserved.</span>
          <div className="ftr-seo">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/eula">EULA</Link>
            <Link href="/contact-us">Contact</Link>
            <a href="/sitemap.xml">Sitemap</a>
            <a href="https://www.linkedin.com/company/teramis/">LinkedIn</a>
            <a href="https://teramis.us/">teramis.us</a>
            <CookieButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
