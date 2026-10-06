const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const pages = require("../content/pages.json");
const root = path.resolve(__dirname, "..");
const origin = "http://127.0.0.1:3147";
const server = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3147",
  ],
  { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
);
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));
(async () => {
  try {
    let ready = false;
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(origin);
        if (r.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert(ready, "Production server did not start: " + log);
    for (let i = 0; i < pages.length; i += 4)
      await Promise.all(
        pages.slice(i, i + 4).map(async (p) => {
          const response = await fetch(origin + p.path);
          assert.equal(response.status, 200, p.path);
          const text = await response.text();
          assert(text.includes("<h1"), p.path + " missing main heading");
          assert(!text.includes("digital marketing agency"), p.path);
          assert(!text.includes("V2 approval document"), p.path);
        }),
      );
    assert.equal((await fetch(origin + "/not-a-real-route")).status, 404);
    const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
    assert(!sitemap.includes("/brief"));
    assert(sitemap.includes("https://teramis-clone.vercel.app/"));
    const robots = await (await fetch(origin + "/robots.txt")).text();
    assert(robots.includes("Disallow: /brief"));
    const image = await fetch(origin + "/opengraph-image");
    assert.equal(image.status, 200);
    assert(image.headers.get("content-type")?.includes("image/png"));
    assert((await image.arrayBuffer()).byteLength > 1000);
    const icon = await fetch(origin + "/icon.svg");
    assert.equal(icon.status, 200);
    for (const file of [
      "findings.csv",
      "boundary-summary.txt",
      "remediation-manifest.csv",
    ]) {
      const response = await fetch(origin + "/samples/" + file);
      assert.equal(response.status, 200);
      assert((await response.text()).includes("SYNTHETIC EXAMPLE"));
    }
    const film = await fetch(origin + "/media/defense-scan.mp4", {
      headers: { Range: "bytes=0-63" },
    });
    assert.equal(film.status, 206);
    assert(film.headers.get("content-type")?.includes("video/mp4"));
    assert.equal(
      Buffer.from(await film.arrayBuffer()).toString("ascii", 4, 8),
      "ftyp",
    );
    const poster = await fetch(origin + "/media/defense-poster.jpg");
    assert.equal(poster.status, 200);
    assert(poster.headers.get("content-type")?.includes("image/jpeg"));
    console.log(
      "Production smoke checks passed: " +
        pages.length +
        " routes, 404, sitemap, robots, social image, favicon, all three downloads, and hero media with byte-range streaming.",
    );
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
})();
