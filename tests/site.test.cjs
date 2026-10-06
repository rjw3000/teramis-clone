const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const root = path.resolve(__dirname, "..");
const pages = JSON.parse(
  fs.readFileSync(path.join(root, "content/pages.json"), "utf8"),
);
const paths = new Set(pages.map((p) => p.path));
function loadTs(name) {
  const filename = path.join(root, name);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  mod._compile(code, filename);
  return mod.exports;
}
const explorer = loadTs("lib/explorer.ts");
test("every published route has content and one main heading", () => {
  for (const p of pages) {
    assert(p.parts.length > 0, p.path);
    assert.equal(p.parts.filter((b) => b.tag === "h1").length, 1, p.path);
  }
});
test("internal content links resolve and imported HTML has only safe formatting", () => {
  for (const p of pages)
    for (const b of p.parts) {
      const hrefs = [b.href, ...(b.html || "").matchAll(/href="([^"]+)"/g)]
        .filter(Boolean)
        .map((x) => (typeof x === "string" ? x : x[1]));
      for (const href of hrefs) {
        assert(!/^(javascript|data):/i.test(href), p.path);
        if (href.startsWith("/"))
          assert(paths.has(href.split(/[?#]/)[0]), p.path + " " + href);
      }
      if (b.html) {
        assert(!/<(?!\/?(?:a|strong|em|b|i|br)\b)[^>]+>/i.test(b.html), p.path);
        assert(!/\bon\w+=/i.test(b.html), p.path);
      }
    }
});
test("draft notes, template copy, and invented testimonials are absent", () => {
  const content = JSON.stringify(pages);
  assert(
    !/digital marketing agency|previous draft|V2 approval document|There are no suggestions|Section B, pending/i.test(
      content,
    ),
  );
  const landing = fs.readFileSync(
    path.join(root, "components/Landing.tsx"),
    "utf8",
  );
  assert(
    !/ILLUSTRATIVE · REPLACE WITH APPROVED QUOTES|Small DIB supplier/.test(
      landing,
    ),
  );
});
test("FAQ questions and answers, complete remediation, and legal content are retained", () => {
  const faq = pages.find((p) => p.path === "/resources/faqs");
  assert(faq.parts.filter((b) => b.tag === "faq").length >= 18);
  for (const q of faq.parts.filter((b) => b.tag === "faq"))
    assert(q.answer?.length > 20, q.text);
  assert(
    pages
      .find((p) => p.path === "/platform/remediation")
      .parts.some((b) =>
        /Turn Remediation Activity Into a Clear Record/.test(b.text),
      ),
  );
  assert(
    pages
      .find((p) => p.path === "/privacy-policy")
      .parts.some((b) => /Contact/i.test(b.text)),
  );
  assert(pages.find((p) => p.path === "/eula").parts.length > 20);
});
test("explorer aggregates reconcile and invalid file deep links stay safe", () => {
  function check(n) {
    assert(n.outside <= n.findings);
    assert(n.findings <= n.files);
    if (n.children) {
      for (const k of ["files", "findings", "outside"])
        assert.equal(
          n[k],
          n.children.reduce((s, c) => s + c[k], 0),
        );
      n.children.forEach(check);
    }
  }
  check(explorer.TREE);
  assert.equal(
    explorer.resolve(["endpoints", "field", "lt007", "f999"]).file,
    null,
  );
  assert.deepEqual(
    explorer.canon(["endpoints", "field", "lt007", "f0", "extra"]),
    ["endpoints", "field", "lt007", "f0"],
  );
  assert.equal(explorer.parseHash("#explorer"), null);
  assert.equal(explorer.parseHash("#explore=%E0%A4%A"), null);
  assert.deepEqual(explorer.parseHash("#explore=endpoints/field/lt007/f0"), [
    "endpoints",
    "field",
    "lt007",
    "f0",
  ]);
});
test("guided scenario reaches an unmarked outside-boundary finding", () => {
  const r = explorer.resolve(["endpoints", "field", "lt007", "f0"]);
  assert.equal(r.file, 0);
  assert.equal(r.files[0].name, "Engineering_Notes_Unmarked.pdf");
  assert.equal(r.files[0].out, true);
  assert.match(r.files[0].marker, /UNMARKED/);
  assert.match(r.files[0].evidence, /authorized review/);
});
test("forms use the published identifiers and the assessment actually receives a form", () => {
  const forms = loadTs("lib/forms.ts");
  assert.equal(
    forms.formForPath("/cui-discovery-readiness-assessment-teramis"),
    "assessment",
  );
  assert.equal(
    forms.FORMS.assessment.id,
    "54c8f224-19d1-4295-9822-fbe8ce62c505",
  );
  assert.equal(forms.FORMS.partner.id, "a8699719-4809-487d-b7f4-75b3cc2530b6");
});
test("metadata has a production origin and examples are explicitly synthetic", () => {
  const site = loadTs("lib/site.ts");
  assert.equal(new URL(site.SITE_URL).protocol, "https:");
  for (const name of [
    "app/page.tsx",
    "app/layout.tsx",
    "app/sitemap.ts",
    "app/robots.ts",
    "app/[...slug]/page.tsx",
  ])
    assert(
      !fs
        .readFileSync(path.join(root, name), "utf8")
        .includes("termamis.awesome"),
      name,
    );
  for (const name of [
    "findings.csv",
    "boundary-summary.txt",
    "remediation-manifest.csv",
  ])
    assert.match(
      fs.readFileSync(path.join(root, "public/samples", name), "utf8"),
      /SYNTHETIC EXAMPLE/,
    );
});

test("hero assets stay browser-compatible, fast-start, and within loading budgets", () => {
  const film = fs.readFileSync(
    path.join(root, "public/media/defense-scan.mp4"),
  );
  const poster = fs.readFileSync(
    path.join(root, "public/media/defense-poster.jpg"),
  );
  assert.equal(film.toString("ascii", 4, 8), "ftyp");
  assert(
    film.includes(Buffer.from("avc1")),
    "Serve H.264 for broad browser support",
  );
  const moov = film.indexOf(Buffer.from("moov"));
  const mdat = film.indexOf(Buffer.from("mdat"));
  assert(
    moov > 0 && mdat > moov,
    "Fast-start metadata must precede media data",
  );
  assert(film.length < 3 * 1024 * 1024, "Hero film exceeds its 3 MiB budget");
  assert.equal(poster.readUInt16BE(0), 0xffd8);
  assert(poster.length < 100 * 1024, "Poster exceeds its 100 KiB budget");
});
