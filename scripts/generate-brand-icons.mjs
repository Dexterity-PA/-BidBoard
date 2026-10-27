import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Keep browser, search, Apple and app icons identical to the existing SVG logo.
const root = new URL("../", import.meta.url);
const svg = await readFile(new URL("app/icon.svg", root));
for (const [path, size] of [
  ["public/favicon-96.png", 96],
  ["app/apple-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/meritously-mark.png", 512],
]) {
  await sharp(svg).resize(size, size).png().toFile(new URL(path, root).pathname);
}

// ICO entries can contain PNG data. Include conventional browser sizes.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((bytes, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(bytes.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += bytes.length;
});
await writeFile(new URL("public/favicon.ico", root), Buffer.concat([header, ...images]));
