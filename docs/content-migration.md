# Full site and resource migration

Content imported from the public Teramis site on October 5, 2026 (America/New_York).

## Coverage

- All 54 URLs from the original public sitemap have matching local routes.
- 26 complete blog articles retain published copy, authors, available dates, tables, links, and inline images.
- 46 original article images are optimized to WebP and served locally. Source URLs are recorded in content/article-image-sources.json.
- All 18 original FAQ answers are preserved in five topic guides. The new knowledge base searches guide titles and full answers.
- 77 content routes cover platform capabilities, solutions, organization types, partners, company, conversion pages, legal pages, blogs, and resources.

The new resource hub, blog, knowledge base, news, case studies, and library share search, topic filters, pagination, and the cinematic navy/cyan/amber branding. Published Johnson Controls content supplies the customer story; company news uses published partner announcements.

No separate knowledge-base source was present in the original navigation or sitemap. The published FAQs and blog provide the source material. The original video page links to Teramis’ public YouTube channel; it did not expose individual video embeds or downloadable white papers to migrate. Existing downloadable examples remain explicitly labeled synthetic.

## Source and maintenance

Original page data remains in content/pages.json. Full article content is in content/articles.json; guides are in content/guides.json. The migration manifest records all original sitemap URLs. Editorial card summaries and categories were corrected where source metadata was misplaced or clipped; article and FAQ body copy is preserved.

To refresh public articles, run python scripts/import-articles.py, then node scripts/import-article-images.mjs. The importer caches fetched HTML in ignored .tooling/articles. Review editorial summaries and categories after a refresh. New sitemap articles will appear in the generated article collection and routes.

## Forms

Demo, assessment, and contact use the original public HubSpot form IDs through the supported developer embed, styled with the site typography and colors. Partner inquiries retain the published legacy embed in a clean light panel because that form is delivered in an isolated iframe. Original consent, validation, CAPTCHA, and submission handling remain intact. The assessment landing page and its alternate entry point both use the assessment form.

Browser QA checked rendering and fields without submitting fabricated leads. Relevant vendor documentation: https://developers.hubspot.com/docs/cms/start-building/features/forms/forms

## Verification

The automated content checks verify complete sitemap coverage, article/image integrity, safe imported markup, and exact FAQ answer coverage. The production smoke test checks every content route, downloads, metadata assets, sitemap, robots, video byte ranges, and the 404 response. Browser checks cover resource search/pagination, FAQ expansion, original forms, article rendering, responsive layout, and mobile navigation.
