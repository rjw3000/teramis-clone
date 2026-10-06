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
      type: page.kind === "article" ? "article" : "website",
      ...(page.kind === "article"
        ? {
            publishedTime: page.published || undefined,
            modifiedTime: page.modified || undefined,
            authors: [page.author || "Teramis"],
          }
        : {}),
      images: [siteUrl(page.image || "/opengraph-image")],
    },
    twitter: {
      card: "summary_large_image",
      images: [siteUrl(page.image || "/opengraph-image")],
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
  const schema =
    page.kind === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: page.title,
          description: page.description,
          mainEntityOfPage: siteUrl(page.path),
          image: page.image ? siteUrl(page.image) : undefined,
          datePublished: page.published || undefined,
          dateModified: page.modified || undefined,
          author: { "@type": "Organization", name: page.author || "Teramis" },
          publisher: {
            "@type": "Organization",
            name: "Teramis",
            logo: { "@type": "ImageObject", url: siteUrl("/assets/logo.avif") },
          },
        }
      : page.parts.some((b) => b.tag === "faq")
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.parts
              .filter((b) => b.tag === "faq")
              .map((b) => ({
                "@type": "Question",
                name: b.text,
                acceptedAnswer: { "@type": "Answer", text: b.answer },
              })),
          }
        : null;
  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <PageView page={page} />
    </>
  );
}
