import Link from "next/link";
import { findPage, type Page } from "../lib/content";

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function PageView({ page }: { page: Page }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={"ul-" + blocks.length}>
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  page.parts.forEach((part, i) => {
    if (part.tag === "li") {
      list.push(part.text);
      return;
    }
    flush();
    if (part.tag === "h1") blocks.push(<h1 key={i}>{part.text}</h1>);
    else if (part.tag === "h2") blocks.push(<h2 key={i}>{part.text}</h2>);
    else if (part.tag === "h3") blocks.push(<h3 key={i}>{part.text}</h3>);
    else blocks.push(<p key={i}>{part.text}</p>);
  });
  flush();
  return (
    <main id="main" tabIndex={-1} className="page">
      <div className="wrap page-in">
        <nav aria-label="Breadcrumb" className="eyebrow">
          <Link href="/">Teramis</Link>
          {page.slug.map((s, i) => (
            <span key={s} style={{ display: "contents" }}>
              <span className="sep">/</span>
              {i === page.slug.length - 1 ? (
                <span className="accent" aria-current="page">{titleCase(s)}</span>
              ) : findPage(page.slug.slice(0, i + 1)) ? (
                <Link href={"/" + page.slug.slice(0, i + 1).join("/")}>{titleCase(s)}</Link>
              ) : (
                <span>{titleCase(s)}</span>
              )}
            </span>
          ))}
        </nav>
        <article className="prose">{blocks}</article>
        {page.form ? (
          <p>
            <a className="pill pill-accent pill-lg" href={page.source}>Open the live Teramis form</a>
          </p>
        ) : null}
        <p className="note">
          Source page: <a href={page.source}>{page.source}</a>. This preview does not add claims that are not on that page.
        </p>
      </div>
    </main>
  );
}
