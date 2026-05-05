import "dotenv/config";
import { chromium, Page } from "playwright";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
}

const supabase = createClient(url, key);

async function extractImages(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const set = new Set<string>();

    document.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || "";

      try {
        const full = new URL(src, window.location.origin).href;

        if (
          full.startsWith("http") &&
          !full.toLowerCase().includes("logo") &&
          !full.toLowerCase().includes("icon") &&
          !full.toLowerCase().includes("sprite") &&
          !full.toLowerCase().includes("placeholder")
        ) {
          set.add(full);
        }
      } catch {}
    });

    return Array.from(set).slice(0, 8);
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, title, source_url, galeria")
    .not("source_url", "is", null);

  if (error) throw error;

  console.log(`Vehículos encontrados: ${vehicles?.length ?? 0}`);

  for (const v of vehicles || []) {
    if (Array.isArray(v.galeria) && v.galeria.length > 1) {
      console.log(`[skip] ${v.title} ya tiene galería`);
      continue;
    }

    try {
      console.log(`[procesando] ${v.title}`);

      await page.goto(v.source_url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await page.waitForTimeout(2500);

      const images = await extractImages(page);

      if (!images.length) {
        console.log(`[sin imágenes] ${v.title}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from("vehicles")
        .update({
          galeria: images,
          imagen_hero: images[0],
          imagen_url: images[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", v.id);

      if (updateError) {
        console.log(`[error update] ${v.title}: ${updateError.message}`);
        continue;
      }

      console.log(`[ok] ${v.title}: ${images.length} imágenes`);
    } catch (err: any) {
      console.log(`[error] ${v.title}: ${err.message}`);
    }
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
