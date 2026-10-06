import type { MetadataRoute } from "next";
import { allPages } from "../lib/content";
import { siteUrl } from "../lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return allPages
    .filter((p) => p.path != "/brief")
    .map((p) => ({ url: siteUrl(p.path) }));
}
