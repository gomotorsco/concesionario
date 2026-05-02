import "dotenv/config";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Faltan SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SOURCE = "chevrolet_colombia";
const START_URLS = [
  "https://www.chevrolet.com.co/",
  "https://www.chevrolet.com.co/vehiculos",
];

const MODEL_KEYWORDS = [
  "spark",
  "captiva",
  "equinox",
  "blazer",
  "tracker",
  "spin",
  "traverse",
  "tahoe",
  "montana",
  "colorado",
  "silverado",
  "onix",
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(input?: string | null) {
  return String(input || "")
    .replace(/\\s+/g, " ")
    .replace(/\\u00a0/g, " ")
    .trim();
}

function hash(input: string) {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 16);
}

function detectCategoria(text: string) {
  const t = text.toLowerCase();
  if (t.includes("pickup") || t.includes("pick-up") || t.includes("montana") || t.includes("colorado")) return "Pick-Ups";
  if (t.includes("suv") || t.includes("captiva") || t.includes("tracker") || t.includes("equinox") || t.includes("tahoe")) return "SUVs";
  if (t.includes("eléctrico") || t.includes("ev") || t.includes("euv")) return "Eléctricos";
  return "Automóviles";
}

function extractPrice(text: string) {
  const normalized = text.replace(/\\./g, "").replace(/,/g, "");
  const match = normalized.match(/\\$\\s?([0-9]{7,12})/);
  return match ? Number(match[1]) : null;
}

async function ensureBucket() {
  const { data } = await supabase.storage.listBuckets();
  const exists = data?.some((b) => b.name === "vehicle-images");

  if (!exists) {
    await supabase.storage.createBucket("vehicle-images", {
      public: true,
      fileSizeLimit: 1024 * 1024 * 10,
    });
  }
}

async function uploadImage(url: string, vehicleSlug: string, index: number) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length < 5000) throw new Error("Imagen demasiado pequeña");

    const path = `${SOURCE}/${vehicleSlug}/${index}-${hash(url)}.${ext}`;

    const { error } = await supabase.storage
      .from("vehicle-images")
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (err: any) {
    console.warn("[image skipped]", url, err.message);
    return null;
  }
}

async function discoverModelUrls(page: any) {
  const discovered = new Set<string>();

  for (const start of START_URLS) {
    try {
      await page.goto(start, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(2500);

      const hrefs: string[] = await page.$$eval("a[href]", (links: HTMLAnchorElement[]) =>
        links.map((a) => a.href).filter(Boolean)
      );

      for (const href of hrefs) {
        const lower = href.toLowerCase();

        if (!lower.includes("chevrolet.com.co")) continue;
        if (lower.includes("concesionario")) continue;
        if (lower.includes("posventa")) continue;
        if (lower.includes("servicio")) continue;
        if (lower.includes("financiacion")) continue;

        if (MODEL_KEYWORDS.some((k) => lower.includes(k))) {
          discovered.add(href.split("#")[0].split("?")[0]);
        }
      }
    } catch (err: any) {
      console.warn("[discover error]", start, err.message);
    }
  }

  return Array.from(discovered);
}

async function scrapeVehicle(page: any, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500);

  const data = await page.evaluate(() => {
    const text = document.body?.innerText || "";

    const title =
      document.querySelector("h1")?.textContent ||
      document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      document.title;

    const description =
      document.querySelector("meta[name='description']")?.getAttribute("content") ||
      document.querySelector("meta[property='og:description']")?.getAttribute("content") ||
      "";

    const images = Array.from(document.querySelectorAll("img"))
      .map((img) => ({
        src: img.getAttribute("src") || img.getAttribute("data-src") || "",
        alt: img.getAttribute("alt") || "",
      }))
      .map((x) => {
        try {
          return {
            src: new URL(x.src, location.origin).href,
            alt: x.alt,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .filter((x: any) => x.src.startsWith("http"))
      .filter((x: any) => !x.src.includes("logo"))
      .slice(0, 18);

    const sections = Array.from(document.querySelectorAll("h2,h3"))
      .map((el) => el.textContent || "")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 30);

    return {
      title,
      description,
      text,
      images,
      sections,
    };
  });

  const title = cleanText(data.title).replace(/Chevrolet/i, "").trim();
  const model = title || url.split("/").filter(Boolean).pop() || "Chevrolet";
  const slug = slugify(`chevrolet-${model}`);
  const fullText = cleanText(`${data.title} ${data.description} ${data.text}`);
  const price = extractPrice(fullText);
  const categoria = detectCategoria(fullText);

  const uniqueImages = Array.from(new Set((data.images || []).map((x: any) => x.src))).slice(0, 8);
  const uploaded: string[] = [];

  for (let i = 0; i < uniqueImages.length; i++) {
    const publicUrl = await uploadImage(uniqueImages[i], slug, i + 1);
    if (publicUrl) uploaded.push(publicUrl);
  }

  return {
    marca: "Chevrolet",
    modelo: model,
    title: `Chevrolet ${model}`,
    slug,
    categoria,
    tipo: "auto",
    precio: price,
    cuota_desde: null,
    moneda: "COP",
    descripcion: cleanText(data.description || fullText.slice(0, 500)),
    imagen_url: uploaded[0] || uniqueImages[0] || null,
    galeria: uploaded,
    specs: {
      secciones_detectadas: data.sections || [],
      texto_fuente_preview: fullText.slice(0, 1500),
    },
    source: SOURCE,
    source_url: url,
    external_id: hash(url),
    review_status: "pending_review",
    estado: "pendiente_revision",
    visible: false,
  };
}

async function upsertVehicle(vehicle: any) {
  const { data, error } = await supabase
    .from("vehicles")
    .upsert(vehicle, {
      onConflict: "source,external_id",
    })
    .select("id,title,source_url")
    .single();

  if (error) throw error;
  return data;
}

async function main() {
  console.log("[scraper] Chevrolet Colombia iniciado");
  await ensureBucket();

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });

  const urls = await discoverModelUrls(page);

  console.log(`[discover] modelos encontrados: ${urls.length}`);
  urls.forEach((u) => console.log(" -", u));

  const report = {
    ok: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (const url of urls) {
    try {
      console.log("[scrape]", url);
      const vehicle = await scrapeVehicle(page, url);
      const saved = await upsertVehicle(vehicle);
      console.log("[saved]", saved.id, saved.title);
      report.ok++;
    } catch (err: any) {
      console.error("[failed]", url, err.message);
      report.failed++;
      report.errors.push({ url, error: err.message });
    }
  }

  await browser.close();

  console.log("\\n====== REPORTE CHEVROLET ======");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
