import Link from "next/link";
import { allPages, findPage, type Block, type Page } from "../lib/content";
import { formForPath } from "../lib/forms";
import { LeadForm } from "./LeadForm";
import { ResourceCollection } from "./ResourceCollection";
const titleCase = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const body = (part: Block) =>
  part.html ? (
    <span dangerouslySetInnerHTML={{ __html: part.html }} />
  ) : (
    part.text
  );
export function PageView({ page }: { page: Page }) {
  const blocks: React.ReactNode[] = [];
  let list: Block[] = [];
  const flush = () => {
    if (list.length)
      blocks.push(
        <ul key={"ul-" + blocks.length}>
          {list.map((part, i) => (
            <li key={i}>{body(part)}</li>
          ))}
        </ul>,
      );
    list = [];
  };
  const kind = formForPath(page.path);
  const firstHeading = page.parts.findIndex((p) => p.tag === "h1");
  page.parts.forEach((part, i) => {
    if (part.tag === "li") {
      list.push(part);
      return;
    }
    flush();
    if (part.tag === "h1")
      blocks.push(
        i === firstHeading ? (
          <h1 key={i}>{part.text}</h1>
        ) : (
          <h2 key={i}>{part.text}</h2>
        ),
      );
    else if (part.tag === "h2") blocks.push(<h2 key={i}>{part.text}</h2>);
    else if (part.tag === "h3") blocks.push(<h3 key={i}>{part.text}</h3>);
    else if (part.tag === "link" && part.href)
      blocks.push(
        <p key={i} className="page-action">
          <Link href={part.href} className="text-link">
            {part.text} →
          </Link>
        </p>,
      );
    else if (part.tag === "faq")
      blocks.push(
        <details key={i} className="faq-item">
          <summary>{part.text}</summary>
          <p>{part.answer}</p>
        </details>,
      );
    else blocks.push(<p key={i}>{body(part)}</p>);
  });
  flush();
  const siblings = allPages
    .filter(
      (p) =>
        p.path !== page.path &&
        p.slug[0] === page.slug[0] &&
        p.slug.length > 1 &&
        p.path !== "/brief",
    )
    .slice(0, 6);
  return (
    <main id="main" tabIndex={-1} className="page">
      <div className={"wrap page-in" + (kind ? " page-with-form" : "")}>
        <nav aria-label="Breadcrumb" className="eyebrow">
          <Link href="/">Teramis</Link>
          {page.slug.map((s, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span className="sep">/</span>
              {i === page.slug.length - 1 ? (
                <span className="accent" aria-current="page">
                  {titleCase(s)}
                </span>
              ) : findPage(page.slug.slice(0, i + 1)) ? (
                <Link href={"/" + page.slug.slice(0, i + 1).join("/")}>
                  {titleCase(s)}
                </Link>
              ) : (
                <span>{titleCase(s)}</span>
              )}
            </span>
          ))}
        </nav>
        <div className={kind ? "conversion-layout" : undefined}>
          {[
            "/resources",
            "/resources/library",
            "/resources/videos-webinars",
            "/teramis-blog",
          ].includes(page.path) ? (
            <ResourceCollection page={page} />
          ) : (
            <article className="prose">{blocks}</article>
          )}
          {kind ? <LeadForm kind={kind} key={kind} /> : null}
        </div>
        {siblings.length ? (
          <aside className="related">
            <h2>Explore more</h2>
            <div className="resource-grid">
              {siblings.map((p) => (
                <Link href={p.path} key={p.path} className="card resource-card">
                  <h3>{p.title.split("|")[0].trim()}</h3>
                  <p>{p.description}</p>
                  <span className="text-link">Explore →</span>
                </Link>
              ))}
            </div>
          </aside>
        ) : null}
        {!kind &&
        !["/privacy-policy", "/eula", "/brief"].includes(page.path) ? (
          <div className="page-next card">
            <h2>Start with your environment.</h2>
            <p>
              Discuss your sources, discovery goals, and next steps with
              Teramis.
            </p>
            <Link href="/request-a-demo" className="pill pill-accent">
              Request a demo →
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
