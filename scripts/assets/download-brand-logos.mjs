import fs from "fs";
import path from "path";
import https from "https";

const OUT_DIR = path.join(process.cwd(), "public", "brand-logos");

const brands = [
  ["chevrolet", "https://cdn.simpleicons.org/chevrolet/111111"],
  ["renault", "https://cdn.simpleicons.org/renault/111111"],
  ["toyota", "https://cdn.simpleicons.org/toyota/111111"],
  ["hyundai", "https://cdn.simpleicons.org/hyundai/111111"],
  ["kia", "https://cdn.simpleicons.org/kia/111111"],
  ["bmw", "https://cdn.simpleicons.org/bmw/111111"],
  ["ford", "https://cdn.simpleicons.org/ford/111111"],
  ["volkswagen", "https://cdn.simpleicons.org/volkswagen/111111"],
  ["honda", "https://cdn.simpleicons.org/honda/111111"],
  ["yamaha", "https://cdn.simpleicons.org/yamaha/111111"],
  ["suzuki", "https://cdn.simpleicons.org/suzuki/111111"],
  ["bajaj", "https://cdn.simpleicons.org/bajaj/111111"],
];

fs.mkdirSync(OUT_DIR, { recursive: true });

function download(url, file) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`${url} -> ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        fs.writeFileSync(file, Buffer.concat(chunks));
        resolve();
      });
    }).on("error", reject);
  });
}

const manifest = {};

for (const [slug, url] of brands) {
  const file = path.join(OUT_DIR, `${slug}.svg`);

  try {
    await download(url, file);
    manifest[slug] = `/brand-logos/${slug}.svg`;
    console.log(`[ok] ${slug}`);
  } catch (err) {
    console.log(`[skip] ${slug}: ${err.message}`);
  }
}

fs.writeFileSync(
  path.join(OUT_DIR, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log("Logos listos en public/brand-logos");
