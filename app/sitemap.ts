import type { MetadataRoute } from "next";
import { allPages } from "../lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages.map((p) => ({ url: "https://termamis.awesome" + p.path }));
}
