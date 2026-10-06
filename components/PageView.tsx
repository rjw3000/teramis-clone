import Link from "next/link";
import {
  allPages,
  blogArticles,
  findPage,
  headingId,
  type Page,
} from "../lib/content";
import { formForPath } from "../lib/forms";
import { LeadForm } from "./LeadForm";
import { ResourceCollection } from "./ResourceCollection";
import { ContentBlocks } from "./ContentBlocks";

const collectionPaths = [
  "/resources",
  "/resources/library",
  "/resources/videos-webinars",
  "/teramis-blog",
  "/resources/knowledge-base",
  "/resources/case-studies",
  "/resources/news",
];
const label = (s: string) =>
  s === "teramis-blog"
    ? "Blog & insights"
    : s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const title = (p: Page) =>
  p.parts.find((b) => b.tag === "h1")?.text || p.title.split("|")[0];
export function PageView({ page }: { page: Page }) {
  const kind = formForPath(page.path);
  const isArticle = page.kind === "article";
  const isGuide = page.kind === "guide";
  const collection = collectionPaths.includes(page.path);
  const firstH1 = page.parts.findIndex((b) => b.tag === "h1");
  const introIndex = page.parts.findIndex(
    (b, i) => i > firstH1 && b.tag === "p" && b.text.length > 70,
  );
  const intro = isArticle
    ? page.description
    : page.parts[introIndex]?.text || page.description;
  const contents = page.parts
    .map((b, i) => ({ ...b, index: i }))
    .filter((b) => b.tag === "h2" || b.tag === "faq");
  const related = (
    isArticle
      ? blogArticles.filter((p) => p.category === page.category)
      : allPages.filter(
          (p) => !p.kind && p.slug[0] === page.slug[0] && p.slug.length > 1,
        )
  )
    .filter((p) => p.path !== page.path && p.path !== "/brief")
    .slice(0, 3);
  const children = allPages.filter(
    (p) =>
      p.slug.length === page.slug.length + 1 &&
      p.path.startsWith(page.path + "/") &&
      !p.kind,
  );
  const legal = ["/privacy-policy", "/eula", "/brief"].includes(page.path);
  const category =
    page.category ||
    (kind
      ? "Talk with Teramis"
      : page.slug[0] === "platform"
        ? "Mission intelligence / Platform"
        : label(page.slug[0]));
  const breadcrumb = (
    <nav aria-label="Breadcrumb" className="page-breadcrumb">
      <Link href="/">Teramis</Link>
      {page.slug.map((s, i) => {
        if (s === "post") return null;
        const path = "/" + page.slug.slice(0, i + 1).join("/");
        return (
          <span key={path}>
            <span aria-hidden="true">/</span>
            {i === page.slug.length - 1 ? (
              <span aria-current="page">
                {isArticle ? "Article" : label(s)}
              </span>
            ) : findPage(page.slug.slice(0, i + 1)) ? (
              <Link href={path}>{label(s)}</Link>
            ) : (
              <span>{label(s)}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
  const hero = (
    <div className="page-hero-copy">
      <span className="eyebrow">TERAMIS / {category}</span>
      <h1>{title(page)}</h1>
      <p className="page-lead">{intro}</p>
      {isArticle ? (
        <div className="article-meta">
          <span>{page.author}</span>
          {page.published ? (
            <time dateTime={page.published}>
              {new Date(page.published).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          ) : null}
          <span>{page.readMinutes} min read</span>
        </div>
      ) : !kind && !legal && !collection && !isGuide ? (
        <div className="row-gap">
          <Link className="pill pill-accent" href="/request-a-demo">
            See it in action →
          </Link>
          <Link className="pill pill-line" href="/#explore">
            Explore the platform
          </Link>
        </div>
      ) : null}
      {kind ? (
        <ul className="conversion-points">
          <li>Discuss your environment and discovery goals</li>
          <li>Review the evidence your team needs</li>
          <li>Plan the right next step together</li>
        </ul>
      ) : null}
    </div>
  );
  return (
    <main
      id="main"
      tabIndex={-1}
      className={
        "page branded-page" +
        (isArticle ? " article-page" : "") +
        (kind ? " conversion-page" : "")
      }
    >
      <div className="wrap">{breadcrumb}</div>
      {collection ? (
        <ResourceCollection page={page} />
      ) : (
        <>
          <section className="page-hero">
            <div className={"wrap" + (kind ? " conversion-hero" : "")}>
              {hero}
              {kind ? <LeadForm kind={kind} /> : null}
            </div>
          </section>
          {isArticle && page.image ? (
            <figure className="wrap article-cover">
              <img
                src={page.image}
                alt={page.imageAlt || ""}
                width={1200}
                height={675}
                fetchPriority="high"
              />
            </figure>
          ) : null}
          {children.length > 1 ? (
            <section
              className="wrap section-directory"
              aria-label="Explore this section"
            >
              <div className="resource-grid">
                {children.map((p) => (
                  <Link
                    href={p.path}
                    className="card resource-card"
                    key={p.path}
                  >
                    <span className="eyebrow">Explore</span>
                    <h2>{p.title.split("|")[0].trim()}</h2>
                    <p>{p.description}</p>
                    <span className="text-link">View details →</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <div
            className={
              "wrap reading-layout" + (contents.length > 2 ? " has-toc" : "")
            }
          >
            {contents.length > 2 ? (
              <aside className="article-toc">
                <span className="eyebrow">On this page</span>
                <nav aria-label="On this page">
                  {contents.map((b) => (
                    <a key={b.index} href={"#" + headingId(b.text, b.index)}>
                      {b.text}
                    </a>
                  ))}
                </nav>
                {isArticle ? (
                  <Link href="/teramis-blog" className="text-link">
                    ← All articles
                  </Link>
                ) : null}
              </aside>
            ) : null}
            <article className="prose branded-prose">
              <ContentBlocks
                parts={
                  kind
                    ? page.parts.map((b) => ({
                        ...b,
                        text: b.text.replace(/form below/gi, "form"),
                        html: b.html?.replace(/form below/gi, "form"),
                      }))
                    : page.parts
                }
                omit={
                  isArticle
                    ? []
                    : [...Array(Math.max(0, firstH1)).keys(), introIndex]
                }
              />
              {isArticle || isGuide ? (
                <p className="content-origin">
                  Published by Teramis.{" "}
                  <a href={page.source}>
                    Original {isGuide ? "FAQ source" : "article"} ↗
                  </a>
                </p>
              ) : null}
            </article>
          </div>
        </>
      )}
      {related.length && !collection && !legal ? (
        <section className="wrap related">
          <span className="eyebrow">Keep exploring</span>
          <h2>
            {isArticle ? "More from the field." : "Connected capabilities."}
          </h2>
          <div className="resource-grid">
            {related.map((p) => (
              <Link href={p.path} key={p.path} className="card resource-card">
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    width={600}
                    height={337}
                  />
                ) : null}
                <h3>{p.title.split("|")[0].trim()}</h3>
                <p>{p.description}</p>
                <span className="text-link">
                  {isArticle ? "Read article" : "Explore"} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {!kind && !legal ? (
        <section className="wrap">
          <div className="page-next">
            <div>
              <span className="eyebrow">From insight to action</span>
              <h2>Make the boundary match reality.</h2>
              <p>
                Bring your sources, questions, and goals. We’ll help you plan
                the next step.
              </p>
            </div>
            <Link href="/request-a-demo" className="pill pill-accent">
              Request a demo →
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
