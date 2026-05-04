import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Faltan variables Supabase en .env");
}

const supabase = createClient(supabaseUrl, serviceKey);

const DEBUG_DIR = path.join(process.cwd(), "storage", "scraper-debug");
const OUT_DIR = path.join(process.cwd(), "public", "vehicle-gallery");

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExt(url: string, contentType?: string | null) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";

  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".webp")) return ".webp";
  if (clean.endsWith(".jpeg")) return ".jpg";
  if (clean.endsWith(".jpg")) return ".jpg";

  return ".jpg";
}

function extractImageUrls(html: string) {
  const found = new Set<string>();

  const patterns = [
    /https?:\/\/[^"'()\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'()\s<>]*)?/gi,
    /"url"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/gi,
    /"src"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/gi,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(html))) {
      const url = match[1] || match[0];
      const normalized = url.replace(/\\u002F/g, "/").replace(/\\\//g, "/");

      if (
        normalized.startsWith("http") &&
        !normalized.toLowerCase().includes("logo") &&
        !normalized.toLowerCase().includes("icon") &&
        !normalized.toLowerCase().includes("sprite") &&
        !normalized.toLowerCase().includes("placeholder") &&
        !normalized.toLowerCase().includes("favicon")
      ) {
        found.add(normalized);
      }
    }
  }

  return Array.from(found).slice(0, 12);
}

async function downloadImage(url: string, folder: string, index: number) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const contentType = res.headers.get("content-type");
  const ext = getExt(url, contentType);
  const fileName = `${String(index + 1).padStart(2, "0")}${ext}`;
  const abs = path.join(folder, fileName);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(abs, buffer);

  return fileName;
}

async function run() {
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, title, slug, source_url, imagen_hero, imagen_url, galeria")
    .order("id", { ascending: true });

  if (error) throw error;

  console.log(`Vehículos en DB: ${vehicles?.length ?? 0}`);

  for (const vehicle of vehicles || []) {
    const slug = vehicle.slug || slugify(vehicle.title);
    const htmlPath = path.join(DEBUG_DIR, slug);

    if (!fs.existsSync(htmlPath)) {
      console.log(`[sin html] ${slug}`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, "utf8");
    const urls = extractImageUrls(html);

    if (!urls.length) {
      console.log(`[sin urls] ${slug}`);
      continue;
    }

    const folder = path.join(OUT_DIR, slug);
    fs.mkdirSync(folder, { recursive: true });

    const localUrls: string[] = [];

    for (let i = 0; i < Math.min(urls.length, 8); i++) {
      try {
        const fileName = await downloadImage(urls[i], folder, i);
        localUrls.push(`/vehicle-gallery/${slug}/${fileName}`);
      } catch (err: any) {
        console.log(`[fallo imagen] ${slug} ${i + 1}: ${err.message}`);
      }
    }

    if (!localUrls.length) {
      console.log(`[no descargó] ${slug}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        imagen_hero: localUrls[0],
        imagen_url: localUrls[0],
        galeria: localUrls,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicle.id);

    if (updateError) {
      console.log(`[error db] ${slug}: ${updateError.message}`);
      continue;
    }

    console.log(`[ok] ${slug}: ${localUrls.length} imágenes`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
