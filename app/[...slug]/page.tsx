import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPages, findPage } from "../../lib/content";
import { PageView } from "../../components/PageView";

export function generateStaticParams() {
  return allPages.filter((p) => p.slug.length).map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string[] } }): Metadata {
  const page = findPage(params.slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: "https://termamis.awesome" + page.path },
  };
}

export default function RoutePage({ params }: { params: { slug: string[] } }) {
  const page = findPage(params.slug);
  if (!page) notFound();
  return <PageView page={page} />;
}
