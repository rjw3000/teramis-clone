import Link from "next/link";
import { blogArticles, knowledgeGuides, type Page } from "../lib/content";
import { ResourceBrowser, type ResourceRecord } from "./ResourceBrowser";
import { ContentBlocks } from "./ContentBlocks";
const record = (p: Page): ResourceRecord => ({
  path: p.path,
  title: p.title,
  description: p.description,
  category: p.category || "Guidance",
  type: p.kind === "guide" ? "FAQ guide" : "Article",
  image: p.image,
  published: p.published,
  readMinutes: p.readMinutes,
  searchText: p.parts.map((b) => b.text + " " + (b.answer || "")).join(" "),
});
const hubs = [
  [
    "Blog & insights",
    "Published perspectives on CUI discovery, compliance, scoping, and risk.",
    "/teramis-blog",
  ],
  [
    "Knowledge base",
    "Answers on data sources, privacy, discovery, boundaries, and approved action.",
    "/resources/knowledge-base",
  ],
  [
    "Customer stories",
    "Explore the published Johnson Controls discovery story.",
    "/resources/case-studies",
  ],
  [
    "Company & partners",
    "Partnership announcements and platform updates.",
    "/resources/news",
  ],
  [
    "Guides & resources",
    "Browse articles, FAQ guides, and clearly labeled example deliverables.",
    "/resources/library",
  ],
  [
    "Videos & webinars",
    "Explore the Teramis channel and published video resources.",
    "/resources/videos-webinars",
  ],
];
export function ResourceCollection({ page }: { page: Page }) {
  const kb = page.path === "/resources/knowledge-base";
  const hub = page.path === "/resources";
  const library = page.path === "/resources/library";
  const video = page.path === "/resources/videos-webinars";
  const news = page.path === "/resources/news";
  const cases = page.path === "/resources/case-studies";
  const title = kb
    ? "Find a clear answer."
    : hub
      ? "Intelligence for the mission."
      : library
        ? "Your next decision starts here."
        : video
          ? "See discovery in action."
          : news
            ? "Stronger together."
            : cases
              ? "Evidence from the field."
              : "Insights from the field.";
  const intro = kb
    ? "Explore practical answers from Teramis’ published FAQs and guidance. Find the context you need before the next discovery conversation."
    : page.description;
  const articles = news
    ? blogArticles.filter((p) => p.category === "Company & partners")
    : cases
      ? blogArticles.filter((p) => p.category === "Customer stories")
      : blogArticles;
  const records = kb
    ? knowledgeGuides
    : library
      ? [...knowledgeGuides, ...articles]
      : articles;
  const featured =
    articles.find((p) => p.path.includes("johnson-controls")) || articles[0];
  return (
    <>
      <section className="page-hero resource-hero">
        <div className="wrap">
          <span className="eyebrow">
            TERAMIS / {kb ? "KNOWLEDGE BASE" : "RESOURCES & INTELLIGENCE"}
          </span>
          <h1>{title}</h1>
          <p className="page-lead">{intro}</p>
          <nav className="resource-tabs" aria-label="Resource sections">
            {[
              ["Resource hub", "/resources"],
              ["Blog", "/teramis-blog"],
              ["Knowledge base", "/resources/knowledge-base"],
              ["Library", "/resources/library"],
            ].map(([name, href]) => (
              <Link
                href={href}
                key={href}
                aria-current={page.path === href ? "page" : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <div className="wrap resource-content">
        {hub ? (
          <>
            <div className="resource-stats">
              <span>
                <strong>{blogArticles.length}</strong> Published articles
              </span>
              <span>
                <strong>{knowledgeGuides.length}</strong> Knowledge guides
              </span>
              <span>
                <strong>18</strong> Original FAQ answers
              </span>
            </div>
            <div className="resource-grid hub-grid">
              {hubs.map(([name, desc, href], i) => (
                <Link href={href} className="card resource-card" key={href}>
                  <span className="eyebrow">0{i + 1} / Explore</span>
                  <h2>{name}</h2>
                  <p>{desc}</p>
                  <span className="text-link">Open collection →</span>
                </Link>
              ))}
            </div>
            <section className="hub-latest">
              <span className="eyebrow">Latest intelligence</span>
              <h2>Keep your perspective current.</h2>
              <ResourceBrowser records={blogArticles.slice(0, 6).map(record)} />
            </section>
          </>
        ) : video ? (
          <div className="video-resource">
            <span className="eyebrow">Teramis / Video channel</span>
            <h2>Practical perspectives. Straight from Teramis.</h2>
            <p>
              Visit the published Teramis YouTube channel for short-form
              explainers, product perspectives, and CUI discovery discussions.
            </p>
            <a
              href="https://www.youtube.com/@Teramis-US/shorts"
              className="pill pill-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Teramis on YouTube ↗
            </a>
            <div className="prose branded-prose">
              <ContentBlocks parts={page.parts} omit={[0, 2, 3]} />
            </div>
          </div>
        ) : (
          <>
            {!kb && !library && !news && featured ? (
              <Link href={featured.path} className="featured-article">
                <img
                  src={featured.image}
                  alt={featured.imageAlt || ""}
                  width={900}
                  height={506}
                />
                <div>
                  <span className="eyebrow">
                    Featured / {featured.category}
                  </span>
                  <h2>{featured.title}</h2>
                  <p>{featured.description}</p>
                  <span className="text-link">Read the story →</span>
                </div>
              </Link>
            ) : null}
            {kb ? (
              <div className="knowledge-intro">
                <h2>What would you like to understand?</h2>
                <p>
                  Search questions and answers, or browse by topic. All answers
                  are drawn from the original published Teramis FAQs.
                </p>
                <Link href="/resources/faqs" className="text-link">
                  View all frequently asked questions →
                </Link>
              </div>
            ) : null}
            <ResourceBrowser
              records={records.map(record)}
              label={
                kb
                  ? "Search the knowledge base"
                  : library
                    ? "Search all resources"
                    : "Search articles"
              }
            />
          </>
        )}
        {library ? (
          <section className="sample-library">
            <span className="eyebrow">Synthetic examples / Downloads</span>
            <h2>See the record behind the finding.</h2>
            <p>
              These files contain fictional data and illustrate a discovery
              conversation.
            </p>
            <div className="resource-grid">
              {[
                ["Finding inventory", "/samples/findings.csv"],
                ["Boundary exception summary", "/samples/boundary-summary.txt"],
                ["Remediation manifest", "/samples/remediation-manifest.csv"],
              ].map(([name, href]) => (
                <a
                  href={href}
                  download
                  key={href}
                  className="card resource-card"
                >
                  <span className="eyebrow">Synthetic example</span>
                  <h3>{name}</h3>
                  <span className="text-link">Download example ↓</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
