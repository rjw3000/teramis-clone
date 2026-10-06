import type { Metadata } from "next";
import { allPages } from "../lib/content";
import { PageView } from "../components/PageView";

const page = allPages.find((p) => p.path === "/")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "https://termamis.awesome/" },
};

export default function Home() {
  return <PageView page={page} />;
}
