"use client";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
export type ResourceRecord = {
  path: string;
  title: string;
  description: string;
  category: string;
  type: string;
  image?: string;
  published?: string;
  readMinutes?: number;
  searchText?: string;
};
export function ResourceBrowser({
  records,
  label = "Search articles",
}: {
  records: ResourceRecord[];
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const search = useDeferredValue(query.trim().toLowerCase());
  const categories = [
    "All",
    ...Array.from(new Set(records.map((r) => r.category))),
  ];
  const filtered = records.filter(
    (r) =>
      (category === "All" || r.category === category) &&
      (!search ||
        [r.title, r.description, r.category, r.searchText]
          .join(" ")
          .toLowerCase()
          .includes(search)),
  );
  const total = Math.ceil(filtered.length / 9);
  const visible = filtered.slice((page - 1) * 9, page * 9);
  return (
    <section
      className="resource-browser"
      aria-label="Resource search and results"
    >
      <div className="resource-search">
        <label htmlFor="resource-query">{label}</label>
        <div>
          <input
            id="resource-query"
            type="search"
            placeholder="Try CUI, scoping, deployment…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <span aria-hidden="true">↗</span>
        </div>
      </div>
      <div className="resource-filters" aria-label="Filter by topic">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="resource-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
        {search ? " matching “" + query + "”" : ""}
      </p>
      {visible.length ? (
        <div className="resource-grid article-grid">
          {visible.map((r) => (
            <Link
              href={r.path}
              key={r.path}
              className="card resource-card article-card"
            >
              {r.image ? (
                <img
                  src={r.image}
                  alt=""
                  width={600}
                  height={337}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="guide-card-top">
                  <span className="eyebrow">{r.type}</span>
                  <span aria-hidden="true">↗</span>
                </div>
              )}
              <div className="article-card-copy">
                <span className="eyebrow">{r.category}</span>
                <h2>{r.title}</h2>
                <p>{r.description}</p>
                <div className="article-card-meta">
                  {r.published ? (
                    <time dateTime={r.published}>
                      {new Date(r.published).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  ) : (
                    <span>{r.type}</span>
                  )}
                  {r.readMinutes ? <span>{r.readMinutes} min read</span> : null}
                </div>
                <span className="text-link">
                  Read {r.type === "Article" ? "article" : "guide"} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="resource-empty">
          <h2>No matching resources.</h2>
          <p>
            Try another term or clear your filters to see all the published
            content.
          </p>
          <button
            className="pill pill-line"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {total > 1 ? (
        <nav
          className="resource-pagination"
          aria-label="Resource results pages"
        >
          <button
            className="pill pill-line"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span aria-live="polite">
            Page {page} of {total}
          </span>
          <button
            className="pill pill-line"
            disabled={page === total}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </nav>
      ) : null}
    </section>
  );
}
