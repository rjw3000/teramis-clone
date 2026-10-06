import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPages, findPage } from "../../lib/content";
import { PageView } from "../../components/PageView";
import { siteUrl } from "../../lib/site";
export const dynamicParams = false;
export function generateStaticParams() {
  return allPages.filter((p) => p.slug.length).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const page = findPage((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: siteUrl(page.path) },
    robots:
      page.path === "/brief" ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.title,
      description: page.description,
      url: siteUrl(page.path),
      images: [siteUrl("/opengraph-image")],
    },
    twitter: {
      card: "summary_large_image",
      images: [siteUrl("/opengraph-image")],
    },
  };
}
export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const page = findPage((await params).slug);
  if (!page) notFound();
  return <PageView page={page} />;
}
