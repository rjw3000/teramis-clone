import Link from "next/link";
import type { Page } from "../lib/content";
export function ResourceCollection({ page }: { page: Page }) {
  const titles = page.parts
    .filter((p) => p.tag === "h2" || p.tag === "h3")
    .map((p) => p.text)
    .sort((a, b) => b.length - a.length);
  const links = page.parts
    .filter((p) => p.tag === "link" && p.href)
    .filter((p) => {
      if (page.path === "/teramis-blog")
        return (
          p.href!.startsWith("https://teramis.us/teramis-blog/") &&
          !/\/(tag|page)\//.test(p.href!)
        );
      return (
        !["/request-a-demo", "/talk-to-us-about-cui", "/contact-us"].includes(
          p.href!,
        ) && !p.href!.startsWith("#")
      );
    });
  const unique = links.filter(
    (p, i) => links.findIndex((other) => other.href === p.href) === i,
  );
  const heading = page.parts.find((p) => p.tag === "h1")?.text || page.title;
  return (
    <article>
      <div className="prose">
        <h1>{heading}</h1>
        <p>{page.description}</p>
      </div>
      <div className="resource-grid collection-grid">
        {unique.map((p) => (
          <Link key={p.href} href={p.href!} className="card resource-card">
            <h2>{titles.find((t) => p.text.includes(t)) || p.text}</h2>
            <span className="text-link">
              {p.href!.startsWith("https://")
                ? "Read on the publisher’s site ↗"
                : "Explore resource →"}
            </span>
          </Link>
        ))}
      </div>
      <div className="page-next card">
        <h2>Explore the evidence behind the interface.</h2>
        <p>
          Download fictional findings, a boundary exception summary, and a
          remediation manifest.
        </p>
        <Link href="/#evidence" className="pill pill-line">
          View sample evidence →
        </Link>
      </div>
    </article>
  );
}
