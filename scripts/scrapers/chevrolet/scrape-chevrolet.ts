import "dotenv/config";
import { chromium, type Page } from "playwright";
import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";
import pLimit from "p-limit";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SCRAPER_STORAGE_BUCKET: z.string().default("vehicle-images"),
  SCRAPER_HEADLESS: z.string().optional(),
});

const env = EnvSchema.parse(process.env);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const BASE_URL = "https://www.chevrolet.com.co";

const CATEGORY_URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/vehiculos-electricos`,
  `${BASE_URL}/camionetas`,
  `${BASE_URL}/comprar-carros`,
  `${BASE_URL}/pickups`,
  `${BASE_URL}/vans`,
  `${BASE_URL}/sitemap`,
];

const SEED_VEHICLES = [
  { model: "Spark EUV", url: "https://www.chevrolet.com.co/vehiculos-electricos/spark-euv" },
  { model: "Captiva EV", url: "https://www.chevrolet.com.co/vehiculos-electricos/captiva-ev" },
  { model: "Equinox EV", url: "https://www.chevrolet.com.co/vehiculos-electricos/equinox-ev" },
  { model: "Blazer EV", url: "https://www.chevrolet.com.co/vehiculos-electricos/blazer-ev" },
  { model: "Tracker", url: "https://www.chevrolet.com.co/camionetas/tracker-suv" },
  { model: "Spin", url: "https://www.chevrolet.com.co/camionetas/spin" },
  { model: "Captiva XL", url: "https://www.chevrolet.com.co/camionetas/captiva-xl" },
  { model: "Traverse", url: "https://www.chevrolet.com.co/camionetas/traverse" },
  { model: "Tahoe", url: "https://www.chevrolet.com.co/camionetas/tahoe" },
  { model: "Onix", url: "https://www.chevrolet.com.co/comprar-carros/onix" },
  { model: "Onix Sedan", url: "https://www.chevrolet.com.co/comprar-carros/onix-sedan" },
  { model: "Montana", url: "https://www.chevrolet.com.co/pickups/montana" },
  { model: "Colorado", url: "https://www.chevrolet.com.co/pickups/colorado" },
  { model: "N400", url: "https://www.chevrolet.com.co/vans/n400" },
];

type VehicleCandidate = {
  brand: "Chevrolet";
  model: string;
  category?: string;
  priceText?: string;
  url: string;
};

type ExtractedImage = {
  src: string;
  alt: string;
  source: string;
};

type VehicleSection = {
  heading: string;
  text: string;
  images: string[];
};

type ScrapedVehicle = {
  source: string;
  source_url: string;
  brand: string;
  model: string;
  slug: string;
  category?: string;
  vehicle_type: string;
  price_text?: string;
  price_amount?: number | null;
  title?: string;
  short_description?: string;
  long_description?: string;
  hero_image_url?: string | null;
  gallery: Array<{
    url: string;
    alt?: string;
    sourceUrl: string;
  }>;
  sections: VehicleSection[];
  specs: Record<string, unknown>;
  raw: Record<string, unknown>;
};

function normalizeText(value?: string | null) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function stripHtml(value: string) {
  return normalizeText(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalizeUrl(url: string) {
  let clean = normalizeText(url).replace(/&amp;/g, "&");

  if (!clean) return "";
  if (clean.startsWith("data:")) return "";
  if (clean.startsWith("blob:")) return "";
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("//")) return `https:${clean}`;
  if (clean.startsWith("/")) return `${BASE_URL}${clean}`;
  return `${BASE_URL}/${clean}`;
}

function moneyToNumber(value?: string) {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function vehicleSlug(brand: string, model: string) {
  return slugify(`${brand}-${model}`, {
    lower: true,
    strict: true,
    trim: true,
  });
}

function isUsefulVehicleUrl(value: string) {
  const clean = value.toLowerCase();

  return (
    clean.includes("spark-euv") ||
    clean.includes("captiva-ev") ||
    clean.includes("equinox-ev") ||
    clean.includes("blazer-ev") ||
    clean.includes("tracker") ||
    clean.includes("spin") ||
    clean.includes("captiva-xl") ||
    clean.includes("blazer") ||
    clean.includes("traverse") ||
    clean.includes("tahoe") ||
    clean.includes("montana") ||
    clean.includes("colorado") ||
    clean.includes("silverado") ||
    clean.includes("onix") ||
    clean.includes("n400")
  );
}

function modelFromUrl(url: string) {
  const last = url.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() || "";

  return normalizeText(
    last
      .replace(/-suv/gi, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function looksLikeVehicleImage(url: string, contentType = "") {
  const lower = url.toLowerCase();
  const ct = contentType.toLowerCase();

  if (!url.startsWith("http")) return false;
  if (lower.includes("element.href")) return false;
  if (lower.includes("undefined")) return false;
  if (lower.includes("null")) return false;
  if (lower.startsWith("data:")) return false;
  if (lower.startsWith("blob:")) return false;

  const isTrash =
    lower.includes("logo") ||
    lower.includes("favicon") ||
    lower.includes("sprite") ||
    lower.includes("icon") ||
    lower.includes("transparent") ||
    lower.includes("placeholder") ||
    lower.includes("whatsapp") ||
    lower.includes("facebook") ||
    lower.includes("instagram") ||
    lower.includes("youtube") ||
    lower.includes("twitter") ||
    lower.includes("linkedin") ||
    lower.includes("pinterest") ||
    lower.endsWith(".svg") ||
    ct.includes("svg");

  if (isTrash) return false;

  if (ct) return ct.includes("image/");

  return (
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".webp") ||
    lower.includes(".avif")
  );
}

async function safeGoto(page: Page, url: string) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(2500);
}

async function autoScroll(page: Page) {
  for (let i = 0; i < 16; i++) {
    await page.mouse.wheel(0, 850);
    await page.waitForTimeout(350);
  }

  await page.evaluate(`window.scrollTo(0, 0)`).catch(() => {});
  await page.waitForTimeout(800);

  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(250);
  }
}

function extractLinksFromHtml(html: string) {
  return Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))
    .map((m) => ({
      href: m[1] || "",
      text: stripHtml(m[2] || ""),
    }))
    .filter((x) => x.href);
}

async function discoverVehicles(page: Page): Promise<VehicleCandidate[]> {
  const candidates = new Map<string, VehicleCandidate>();

  for (const categoryUrl of CATEGORY_URLS) {
    try {
      console.log(`[discover] ${categoryUrl}`);
      await safeGoto(page, categoryUrl);
      await autoScroll(page);

      const html = await page.content();
      const links = extractLinksFromHtml(html);

      for (const link of links) {
        const absolute = normalizeUrl(link.href).split("?")[0];
        const haystack = `${absolute} ${link.text}`;

        if (!isUsefulVehicleUrl(haystack)) continue;

        const model = normalizeText(link.text) || modelFromUrl(absolute);
        if (!model || model.length < 2) continue;

        candidates.set(absolute, {
          brand: "Chevrolet",
          model,
          url: absolute,
          category: categoryUrl.split("/").pop() || "home",
        });
      }
    } catch (error) {
      console.error(`[discover:error] ${categoryUrl}`, error);
    }
  }

  const discovered = Array.from(candidates.values());

  if (discovered.length === 0) {
    console.warn("[fallback] usando SEED_VEHICLES");

    return SEED_VEHICLES.map((v) => ({
      brand: "Chevrolet",
      model: v.model,
      url: v.url,
      category: "seed",
    }));
  }

  return discovered;
}

function pick(html: string, regex: RegExp) {
  return html.match(regex)?.[1]?.trim() || "";
}

function pushImage(map: Map<string, ExtractedImage>, src: string, alt: string, source: string) {
  const normalized = normalizeUrl(src);
  if (!normalized) return;
  if (!looksLikeVehicleImage(normalized)) return;
  map.set(normalized, { src: normalized, alt: normalizeText(alt), source });
}

function extractSrcset(value: string) {
  return value
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractImagesFromHtml(html: string): ExtractedImage[] {
  const images = new Map<string, ExtractedImage>();

  const attrPatterns = [
    { source: "html:src", regex: /\ssrc=["']([^"']+)["']/gi },
    { source: "html:data-src", regex: /\sdata-src=["']([^"']+)["']/gi },
    { source: "html:data-lazy-src", regex: /\sdata-lazy-src=["']([^"']+)["']/gi },
    { source: "html:data-original", regex: /\sdata-original=["']([^"']+)["']/gi },
    { source: "html:data-desktop", regex: /\sdata-desktop=["']([^"']+)["']/gi },
    { source: "html:data-mobile", regex: /\sdata-mobile=["']([^"']+)["']/gi },
    { source: "html:data-bg", regex: /\sdata-bg=["']([^"']+)["']/gi },
    { source: "html:poster", regex: /\sposter=["']([^"']+)["']/gi },
  ];

  for (const item of attrPatterns) {
    let match: RegExpExecArray | null;

    while ((match = item.regex.exec(html))) {
      pushImage(images, match[1] || "", "", item.source);
    }
  }

  let srcsetMatch: RegExpExecArray | null;
  const srcsetRegex = /\ssrcset=["']([^"']+)["']/gi;

  while ((srcsetMatch = srcsetRegex.exec(html))) {
    for (const url of extractSrcset(srcsetMatch[1] || "")) {
      pushImage(images, url, "", "html:srcset");
    }
  }

  let bgMatch: RegExpExecArray | null;
  const bgRegex = /url\((['"]?)(.*?)\1\)/gi;

  while ((bgMatch = bgRegex.exec(html))) {
    pushImage(images, bgMatch[2] || "", "", "html:background");
  }

  let jsonImageMatch: RegExpExecArray | null;
  const jsonImageRegex = /https?:\/\/[^"'\\\s)]+?\.(?:jpg|jpeg|png|webp|avif)(?:\?[^"'\\\s)]*)?/gi;

  while ((jsonImageMatch = jsonImageRegex.exec(html))) {
    pushImage(images, jsonImageMatch[0] || "", "", "html:json-url");
  }

  return Array.from(images.values());
}

async function extractImagesFromBrowser(page: Page): Promise<ExtractedImage[]> {
  const raw = await page.evaluate(`
(() => {
  const out = [];

  const add = (src, alt, source) => {
    if (!src) return;
    out.push({ src: String(src), alt: String(alt || ""), source });
  };

  document.querySelectorAll("img").forEach((img) => {
    add(img.currentSrc, img.alt, "dom:img-currentSrc");
    add(img.src, img.alt, "dom:img-src");
    add(img.getAttribute("src"), img.alt, "dom:img-attr-src");
    add(img.getAttribute("data-src"), img.alt, "dom:data-src");
    add(img.getAttribute("data-lazy-src"), img.alt, "dom:data-lazy-src");

    const srcset = img.getAttribute("srcset");
    if (srcset) {
      srcset.split(",").forEach((p) => add(p.trim().split(/\\s+/)[0], img.alt, "dom:img-srcset"));
    }
  });

  document.querySelectorAll("source").forEach((source) => {
    const srcset = source.getAttribute("srcset") || source.getAttribute("data-srcset");
    if (srcset) {
      srcset.split(",").forEach((p) => add(p.trim().split(/\\s+/)[0], "", "dom:source-srcset"));
    }
  });

  document.querySelectorAll("*").forEach((el) => {
    const style = window.getComputedStyle(el);
    const bg = style.backgroundImage || "";
    const matches = [...bg.matchAll(/url\\((['"]?)(.*?)\\1\\)/g)];
    matches.forEach((m) => add(m[2], "", "dom:background"));
  });

  performance.getEntriesByType("resource").forEach((entry) => {
    add(entry.name, "", "performance");
  });

  return out;
})()
`);

  const images = new Map<string, ExtractedImage>();

  for (const item of raw as Array<{ src?: string; alt?: string; source?: string }>) {
    const normalized = normalizeUrl(item.src || "");
    if (!normalized) continue;

    images.set(normalized, {
      src: normalized,
      alt: normalizeText(item.alt || ""),
      source: item.source || "browser",
    });
  }

  console.log("[dom-debug] rawBrowserImages=", raw.length);

  return Array.from(images.values());
}

function mergeImages(...groups: ExtractedImage[][]) {
  const map = new Map<string, ExtractedImage>();

  for (const group of groups) {
    for (const img of group) {
      const normalized = normalizeUrl(img.src);
      if (!normalized) continue;
      if (!looksLikeVehicleImage(normalized)) continue;
      map.set(normalized, {
        src: normalized,
        alt: img.alt,
        source: img.source,
      });
    }
  }

  return Array.from(map.values())
    .filter((img) => looksLikeVehicleImage(img.src))
    .slice(0, 80);
}

function extractSectionsFromHtml(html: string) {
  const sectionMatches = Array.from(
    html.matchAll(/<(section|article|main)[^>]*>([\s\S]*?)<\/\1>/gi)
  ).map((m) => m[2]);

  return sectionMatches
    .map((sectionHtml) => {
      const heading =
        stripHtml(sectionHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "") ||
        stripHtml(sectionHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || "") ||
        stripHtml(sectionHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || "");

      const text = stripHtml(sectionHtml);
      const images = extractImagesFromHtml(sectionHtml).map((img) => img.src);

      return { heading, text, images };
    })
    .filter((section) => section.text.length > 80 && section.text.length < 3500)
    .slice(0, 30);
}

async function extractVehicleDetail(
  page: Page,
  candidate: VehicleCandidate
): Promise<ScrapedVehicle> {
  console.log(`[detail] ${candidate.model} -> ${candidate.url}`);

  const networkImages = new Map<string, ExtractedImage>();

  page.on("response", async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()["content-type"] || "";

      if (looksLikeVehicleImage(url, contentType)) {
        networkImages.set(url, {
          src: url,
          alt: candidate.model,
          source: `network:${contentType}`,
        });
      }
    } catch {
      // ignore
    }
  });

  await safeGoto(page, candidate.url);

  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await autoScroll(page);
  await page.waitForTimeout(5000);
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});

  const html = await page.content();
  const pageTitle = await page.title();

  await import("fs").then(({ writeFileSync, mkdirSync }) => {
    mkdirSync("storage/scraper-debug", { recursive: true });
    const safeName = candidate.model.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    writeFileSync(`storage/scraper-debug/${safeName}.html`, html);
  });

  console.log("[debug-html]", candidate.model, "htmlLength=", html.length);

  const title =
    stripHtml(pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)) ||
    normalizeText(pageTitle) ||
    candidate.model;

  const metaDescription =
    pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);

  const bodyText = stripHtml(html);

  const priceText =
    bodyText.match(/(?:DESDE|Precio Sugerido)\s*:?\s*\$[\d\.,]+/i)?.[0] ||
    bodyText.match(/\$[\d\.,]+\s*\*/)?.[0] ||
    bodyText.match(/\$[\d\.,]+/)?.[0] ||
    candidate.priceText ||
    "";

  const model = candidate.model || title.replace(/Chevrolet/gi, "").trim();
  const slug = vehicleSlug("Chevrolet", model);

  const htmlImages = extractImagesFromHtml(html);
  const domImages = await extractImagesFromBrowser(page);
  const netImages = Array.from(networkImages.values());

  const scriptImages = Array.from(
    html.matchAll(/https?:\/\/[^"'\\s)]+\.(?:jpg|jpeg|png|webp|avif)(?:\?[^"'\\s)]*)?/gi)
  ).map((m) => ({
    src: m[0],
    alt: model,
    source: "script-json",
  }));

  const rawImages = mergeImages(htmlImages, domImages, netImages, scriptImages);

  console.log(
    `[images] ${model} html=${htmlImages.length} dom=${domImages.length} network=${netImages.length} total=${rawImages.length}`
  );

  const uploadedGallery: ScrapedVehicle["gallery"] = [];

  for (let i = 0; i < rawImages.length; i++) {
    const image = rawImages[i];

    try {
      const uploadedUrl = await downloadAndUploadImage({
        imageUrl: image.src,
        slug,
        index: i,
      });

      if (uploadedUrl) {
        uploadedGallery.push({
          url: uploadedUrl,
          alt: image.alt || model,
          sourceUrl: image.src,
        });
      }
    } catch (error) {
      console.warn(`[image:error] ${image.src}`, error);
    }
  }

  const sections = extractSectionsFromHtml(html);

  const specsLikeText = bodyText
    .split(".")
    .map(normalizeText)
    .filter(Boolean)
    .filter((line) =>
      /motor|potencia|torque|transmisión|combustible|airbags|dimensiones|capacidad|velocidad|autonomía|batería|eléctrico|híbrido/i.test(line)
    )
    .slice(0, 80);

  return {
    source: "chevrolet_colombia",
    source_url: candidate.url,
    brand: "Chevrolet",
    model,
    slug,
    category: candidate.category,
    vehicle_type: "auto",
    price_text: priceText,
    price_amount: moneyToNumber(priceText),
    title,
    short_description: normalizeText(metaDescription),
    long_description: sections[0]?.text || normalizeText(metaDescription),
    hero_image_url: uploadedGallery[0]?.url ?? null,
    gallery: uploadedGallery,
    sections,
    specs: {
      extractedLines: specsLikeText,
    },
    raw: {
      canonical:
        pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
        candidate.url,
      documentTitle: pageTitle,
      discoveredFrom: candidate,
      sourceImages: rawImages,
    },
  };
}

async function downloadAndUploadImage(params: {
  imageUrl: string;
  slug: string;
  index: number;
}) {
  const response = await fetch(params.imageUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      referer: BASE_URL,
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("image") || contentType.includes("svg")) {
    return null;
  }

  const input = Buffer.from(await response.arrayBuffer());

  if (input.length < 5000) {
    return null;
  }

  const optimized = await sharp(input)
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
    })
    .toBuffer();

  const dir = `public/uploads/vehicles/chevrolet/${params.slug}`;
  const filename = `${String(params.index + 1).padStart(2, "0")}.webp`;
  const diskPath = `${dir}/${filename}`;
  const publicPath = `/uploads/vehicles/chevrolet/${params.slug}/${filename}`;

  await mkdir(dir, { recursive: true });
  await writeFile(diskPath, optimized);

  return publicPath;
}

async function upsertVehicle(vehicle: ScrapedVehicle) {
  const payload = {
    source: vehicle.source,
    source_url: vehicle.source_url,
    brand: vehicle.brand,
    model: vehicle.model,
    slug: vehicle.slug,
    category: vehicle.category,
    vehicle_type: vehicle.vehicle_type,
    price_text: vehicle.price_text,
    price_amount: vehicle.price_amount,
    title: vehicle.title,
    short_description: vehicle.short_description,
    long_description: vehicle.long_description,
    hero_image_url: vehicle.hero_image_url,
    gallery: vehicle.gallery,
    sections: vehicle.sections,
    specs: vehicle.specs,
    raw: vehicle.raw,
    status: "pending_review",
    scrape_status: "ok",
    scrape_error: null,
    last_scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("scraped_vehicles")
    .upsert(payload, {
      onConflict: "source_url",
    });

  if (error) throw error;
}

async function saveFailedVehicle(candidate: VehicleCandidate, error: unknown) {
  await supabase.from("scraped_vehicles").upsert(
    {
      source: "chevrolet_colombia",
      source_url: candidate.url,
      brand: "Chevrolet",
      model: candidate.model,
      slug: vehicleSlug("Chevrolet", candidate.model),
      category: candidate.category,
      vehicle_type: "auto",
      status: "pending_review",
      scrape_status: "error",
      scrape_error: error instanceof Error ? error.message : String(error),
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "source_url" }
  );
}

async function main() {
  const context = await chromium.launchPersistentContext(
    "storage/profiles/chevrolet-chrome",
    {
      channel: "chrome",
      headless: false,
      viewport: { width: 1366, height: 768 },
      locale: "es-CO",
      timezoneId: "America/Bogota",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      extraHTTPHeaders: {
        "accept-language": "es-CO,es;q=0.9,en;q=0.8",
      },
    }
  );

  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      Object.defineProperty(navigator, "languages", {
        get: () => ["es-CO", "es", "en"],
      });

      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    const page = await context.newPage();

    const candidates = await discoverVehicles(page);

    console.log(`[discover:done] encontrados=${candidates.length}`);

    const limit = pLimit(1);

    const results = await Promise.allSettled(
      candidates.map((candidate) =>
        limit(async () => {
          const detailPage = await context.newPage();

          try {
            const vehicle = await extractVehicleDetail(detailPage, candidate);
            await upsertVehicle(vehicle);

            console.log(
              `[saved] ${vehicle.brand} ${vehicle.model} images=${vehicle.gallery.length}`
            );

            return vehicle;
          } catch (error) {
            console.error(`[vehicle:error] ${candidate.url}`, error);
            await saveFailedVehicle(candidate, error);
            throw error;
          } finally {
            await detailPage.close().catch(() => {});
          }
        })
      )
    );

    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log("====================================");
    console.log(`[final] ok=${ok} failed=${failed}`);
    console.log("====================================");
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error("[fatal]", error);
  process.exit(1);
});
