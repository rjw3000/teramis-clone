# Teramis site

Next.js site combining the public Teramis content with an interactive synthetic CUI explorer.

## Run and verify

Use Node.js 20.9 or newer.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run smoke
npm start
```

For local development: `npm run dev`.

## Production origin

`NEXT_PUBLIC_SITE_URL` controls canonical URLs, metadata, sitemap, and robots. It defaults to
`https://teramis-clone.vercel.app`. Set the variable to the intended public origin and rebuild
when moving domains. Copy `.env.example` to `.env.local` for a local override.

The historical `/brief` page remains available but is excluded from the sitemap and indexing.

## Content and resources

`content/pages.json` contains complete public page content imported from teramis.us.
The renderer preserves safe inline links and formatting, FAQ questions and answers, and
resource navigation. Published stories and blog articles link to the original publisher.
The contact, privacy, and EULA pages have complete content rather than empty placeholders.

`python scripts/refresh-content.py` refreshes the public content using only the Python
standard library. Review content changes before publishing; the importer removes known
template and editorial notes and maps legacy links to existing routes.

The homepage retains the environment → source → repository → location → file explorer,
with browser history, deep links, Escape navigation, filters, and a guided unmarked finding.
Review and remediation controls change demonstration state only. All example data and the
downloads in `public/samples` are fictional, not customer evidence or a production specification.

## Forms

`lib/forms.ts` records the public HubSpot portal, region, and form identifiers read from
the published demo, readiness assessment, partner, and contact pages. The embeds keep the
existing provider's fields, validation, consent, CAPTCHA, and post-submission behavior.
Third-party form code loads when the form approaches the viewport; each embed has an
always-available link to the corresponding original page and a load-error fallback.

No credentials are needed or stored. Automated verification does not submit real leads.
Confirm the intended production hostname and perform an authorized CRM submission check
before treating lead delivery as verified.

## Checks

Eight regression tests cover content completeness, safe imported markup, internal links,
FAQ structure, restored legal/remediation content, explorer aggregates and invalid hashes,
the guided scenario, form mappings, production origins, and synthetic downloads.
GitHub Actions runs the tests, type checking, production build, and production smoke checks across all 42 routes, downloads, social image, sitemap, robots, and 404 handling.

Next.js was upgraded to a patched 15.5 release, with a patched PostCSS override.
