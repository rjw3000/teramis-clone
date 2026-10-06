import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = path.resolve(import.meta.dirname, "..");
const articles = JSON.parse(
  await fs.readFile(path.join(root, "content/articles.json"), "utf8"),
);
const output = path.join(root, "public/media/articles");
await fs.mkdir(output, { recursive: true });
const sources = new Map();
for (const a of articles) {
  if (a.image) sources.set(a.sourceImage || a.image, null);
  for (const b of a.parts)
    if (b.tag === "image") sources.set(b.sourceSrc || b.src, null);
}
const queue = [...sources.keys()];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const source = queue.shift();
      const name =
        crypto.createHash("sha256").update(source).digest("hex").slice(0, 14) +
        ".webp";
      const file = path.join(output, name);
      try {
        await fs.access(file);
      } catch {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`${response.status}: ${source}`);
        await sharp(Buffer.from(await response.arrayBuffer()))
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(file);
      }
      sources.set(source, "/media/articles/" + name);
    }
  }),
);
for (const a of articles) {
  if (a.image) {
    a.sourceImage ||= a.image;
    a.image = sources.get(a.sourceImage);
  }
  for (const b of a.parts)
    if (b.tag === "image") {
      b.sourceSrc ||= b.src;
      b.src = sources.get(b.sourceSrc);
    }
}
await fs.writeFile(
  path.join(root, "content/articles.json"),
  JSON.stringify(articles, null, 2) + "\n",
);
await fs.writeFile(
  path.join(root, "content/article-image-sources.json"),
  JSON.stringify(Object.fromEntries(sources), null, 2) + "\n",
);
console.log(`Optimized ${sources.size} original images for local delivery.`);
