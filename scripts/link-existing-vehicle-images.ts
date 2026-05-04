import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_DIR = path.join(process.cwd(), "public", "uploads", "vehicles", "chevrolet");

function norm(input: string) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/chevrolet|camioneta|camionetas|suv|van|pick-up|pick|colombia|4x4/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findFolder(vehicle: any, folders: string[]) {
  const candidates = [vehicle.slug, vehicle.title, vehicle.modelo]
    .filter(Boolean)
    .map(norm);

  for (const c of candidates) {
    const exact = folders.find((f) => norm(f) === c);
    if (exact) return exact;
  }

  for (const c of candidates) {
    const loose = folders.find((f) => {
      const nf = norm(f);
      return nf.includes(c) || c.includes(nf);
    });
    if (loose) return loose;
  }

  return null;
}

async function run() {
  if (!fs.existsSync(BASE_DIR)) {
    throw new Error(`No existe ${BASE_DIR}`);
  }

  const folders = fs
    .readdirSync(BASE_DIR, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .map((x) => x.name);

  console.log("Carpetas encontradas:", folders.length);

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, title, slug, modelo")
    .eq("marca", "Chevrolet")
    .order("id", { ascending: true });

  if (error) throw error;

  for (const vehicle of vehicles || []) {
    const folder = findFolder(vehicle, folders);

    if (!folder) {
      console.log("[sin carpeta]", vehicle.title);
      continue;
    }

    const absFolder = path.join(BASE_DIR, folder);

    const files = fs
      .readdirSync(absFolder)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort()
      .slice(0, 8);

    if (!files.length) {
      console.log("[sin imágenes]", folder);
      continue;
    }

    const urls = files.map((file) => `/uploads/vehicles/chevrolet/${folder}/${file}`);

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        imagen_hero: urls[0],
        imagen_url: urls[0],
        galeria: urls,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicle.id);

    if (updateError) {
      console.log("[error db]", vehicle.title, updateError.message);
      continue;
    }

    console.log("[ok]", vehicle.title, "->", folder, urls.length);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
