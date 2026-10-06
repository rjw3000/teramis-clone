export type Block = {
  tag:
    | "h1"
    | "h2"
    | "h3"
    | "p"
    | "li"
    | "link"
    | "faq"
    | "image"
    | "quote"
    | "table";
  text: string;
  html?: string;
  href?: string;
  answer?: string;
  src?: string;
  rows?: string[][];
  header?: boolean;
};
export type Page = {
  slug: string[];
  path: string;
  title: string;
  description: string;
  source: string;
  parts: Block[];
  form: boolean;
  kind?: "article" | "guide";
  category?: string;
  published?: string;
  modified?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  readMinutes?: number;
};
import pages from "../content/pages.json";
import articles from "../content/articles.json";
import guides from "../content/guides.json";
export const blogArticles = articles as Page[];
export const knowledgeGuides = guides as Page[];
export const allPages = [...pages, ...articles, ...guides] as Page[];
export function headingId(text: string, index: number) {
  return (
    "section-" +
    index +
    "-" +
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 70)
  );
}
export function localHref(href: string) {
  if (href.startsWith("https://teramis.us/")) {
    const parsed = new URL(href);
    if (allPages.some((p) => p.path === parsed.pathname))
      return parsed.pathname + parsed.search + parsed.hash;
    if (parsed.pathname === "/post") return "/teramis-blog";
  }
  return href;
}
export function findPage(slug: string[]) {
  const key = slug.join("/");
  return allPages.find((p) => p.slug.join("/") === key);
}
