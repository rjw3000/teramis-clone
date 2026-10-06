export type Block = { tag: "h1" | "h2" | "h3" | "p" | "li"; text: string };
export type Page = {
  slug: string[];
  path: string;
  title: string;
  description: string;
  source: string;
  parts: Block[];
  form: boolean;
};
import pages from "../content/pages.json";
export const allPages = pages as Page[];
export function findPage(slug: string[]) {
  const key = slug.join("/");
  return allPages.find((p) => p.slug.join("/") === key);
}
