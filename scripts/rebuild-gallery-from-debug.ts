import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEBUG_DIR = path.join(process.cwd(), "storage", "scraper-debug");
const OUT_DIR = path.join(process.cwd(), "public", "vehicle-gallery");

function getSlugFromUrl(url: string) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

function extractImages(html: string) {
  const set = new Set<string>();

  const regex = /https?:\/\/[^"'()\s<>]+?\.(jpg|jpeg|png|webp)/gi;

  let match;
  while ((match = regex.exec(html))) {
    const url = match[0];

    if (
      url.startsWith("http") &&
      !url.includes("logo") &&
      !url.includes("icon") &&
      !url.includes("sprite")
    ) {
      set.add(url);
    }
  }

  return Array.from(set).slice(0, 8);
}

async function download(url: string, folder: string, index: number) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fail");

  const ext = ".jpg";
  const name = `${index + 1}${ext}`;
  const filePath = path.join(folder, name);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/vehicle-gallery/${path.basename(folder)}/${name}`;
}

async function run() {
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, title, source_url");

  for (const v of vehicles || []) {
    const fileSlug = getSlugFromUrl(v.source_url);

    if (!fileSlug) {
      console.log("[sin slug]", v.title);
      continue;
    }

    const htmlPath = path.join(DEBUG_DIR, fileSlug);

    if (!fs.existsSync(htmlPath)) {
      console.log("[no html]", fileSlug);
      continue;
    }

    console.log("[procesando]", v.title);

    const html = fs.readFileSync(htmlPath, "utf8");
    const images = extractImages(html);

    if (!images.length) {
      console.log("[sin imgs]", v.title);
      continue;
    }

    const folder = path.join(OUT_DIR, fileSlug);
    fs.mkdirSync(folder, { recursive: true });

    const saved: string[] = [];

    for (let i = 0; i < images.length; i++) {
      try {
        const local = await download(images[i], folder, i);
        saved.push(local);
      } catch {}
    }

    if (!saved.length) continue;

    await supabase
      .from("vehicles")
      .update({
        galeria: saved,
        imagen_hero: saved[0],
        imagen_url: saved[0],
      })
      .eq("id", v.id);

    console.log("[ok]", v.title, saved.length);
  }
}

run();
