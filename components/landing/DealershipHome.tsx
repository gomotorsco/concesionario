import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";

export default function DealershipHome() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#151515]">
      <TopTrustBar />

      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <a href="/" className="group">
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#8b6f3e]">
              Grupo automotriz
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-[#101010]">
              AutoMarket Premium
            </p>
EOF;</article>Name="mt-2 text-sm leading-6 text-black/55">{text}</p>r rounded-fu

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ cat > components/landing/PremiumVehiclesCatalog.tsx <<'EOF'
"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = {
  id: number;
  title: string;
  slug?: string | null;
  tipo?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anio?: number | null;
  km?: number | null;
  precio?: number | null;
  cuota_desde?: number | null;
  moneda?: string | null;
  estado?: string | null;
  destacado?: boolean | null;
  imagen_url?: string | null;
};

type Section = {
  id: number;
EOF;</div>v></article>aluar financiaciónover:bg-[#c6a15b] hover:border-[#c6a15b]

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ git add components/landing/DealershipHome.tsx components/landing/PremiumVehiclesCatalog.tsx
git commit -m "style: redesign public home with premium dealership branding"
git push origin main
warning: in the working copy of 'components/landing/DealershipHome.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'components/landing/PremiumVehiclesCatalog.tsx', LF will be replaced by CRLF the next time Git touches it
[main 3ad30fa] style: redesign public home with premium dealership branding
 2 files changed, 242 insertions(+), 167 deletions(-)
Enumerating objects: 11, done.
Counting objects: 100% (11/11), done.
Delta compression using up to 4 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 4.65 KiB | 432.00 KiB/s, done.
Total 6 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To https://github.com/DavidFlautero/concesionarioBogota.git
   4468df9..3ad30fa  main -> main

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ cd ~/desktop/concesionario-pro

cat app/api/vendedores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/vendedores error", error);
    return NextResponse.json({ vendedores: [] }, { status: 500 });
  }

  return NextResponse.json({ vendedores: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "create") {
    const {
      nombre,
      email,
      password,
      whatsapp,
      zona,
      rol,
      fecha_ingreso,
      meta_mensual,
      meta_conversion,
      meta_leads_trabajados,
      notas,
    } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { message: "Nombre, email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .insert([
        {
          nombre: String(nombre).trim(),
          email: String(email).trim(),
          password: String(password),
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          zona: zona ? String(zona).trim() : null,
          rol: rol || "vendedor",
          fecha_ingreso: fecha_ingreso || null,
          meta_mensual: Number(meta_mensual || 10),
          meta_conversion: Number(meta_conversion || 10),
          meta_leads_trabajados: Number(meta_leads_trabajados || 50),
          notas: notas ? String(notas).trim() : null,
          activo: true,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/vendedores create error", error);
      return NextResponse.json(
        { message: "No se pudo crear el vendedor." },
        { status: 500 }
      );
    }

    return NextResponse.json({ vendedor: data });
  }

  if (body.type === "update") {
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "id requerido." }, { status: 400 });
    }

    const update: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    [
      "nombre",
      "email",
      "whatsapp",
      "zona",
      "rol",
      "fecha_ingreso",
      "notas",
    ].forEach((key) => {
      if (body[key] !== undefined) update[key] = body[key] || null;
    });

    if (body.password !== undefined && body.password !== "") {
      update.password = String(body.password);
    }

    if (body.meta_mensual !== undefined) update.meta_mensual = Number(body.meta_mensual);
    if (body.meta_conversion !== undefined) update.meta_conversion = Number(body.meta_conversion);
    if (body.meta_leads_trabajados !== undefined) update.meta_leads_trabajados = Number(body.meta_leads_trabajados);
    if (body.activo !== undefined) update.activo = Boolean(body.activo);

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/vendedores update error", error);
      return NextResponse.json(
        { message: "No se pudo actualizar el vendedor." },
        { status: 500 }
      );
    }

    return NextResponse.json({ vendedor: data });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ cd ~/desktop/concesionario-pro

perl -0pi -e 's/return NextResponse\.json\(\s*\{ message: "No se pudo crear el vendedor\." \},\s*\{ status: 500 \}\s*\);/return NextResponse.json({ message: error.message, details: error.details, code: error.code }, { status: 500 });/s' app/api/vendedores/route.ts

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ git add app/api/vendedores/route.ts
git commit -m "fix: expose seller create error"
git push origin main
warning: in the working copy of 'app/api/vendedores/route.ts', LF will be replaced by CRLF the next time Git touches it
[main accaf5b] fix: expose seller create error
 1 file changed, 1 insertion(+), 4 deletions(-)
Enumerating objects: 11, done.
Counting objects: 100% (11/11), done.
Delta compression using up to 4 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (6/6), 539 bytes | 179.00 KiB/s, done.
Total 6 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To https://github.com/DavidFlautero/concesionarioBogota.git
   3ad30fa..accaf5b  main -> main

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ cd ~/desktop/concesionario-pro

cat > app/api/vendedores/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ vendedores: [], message: error.message }, { status: 500 });
  }

  return NextResponse.json({ vendedores: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

EOFs: 500 });xtResponse.json({ message: err?.message || "Error interno." }, { st

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ cat > app/\(dashboard\)/admin/equipo/page.tsx <<'EOF'
"use client";

import { FormEvent, useEffect, useState } from "react";

type Vendedor = {
  id: string;
  nombre: string;
  email: string;
  whatsapp?: string | null;
  zona?: string | null;
  rol?: string | null;
  fecha_ingreso?: string | null;
  meta_mensual?: number;
  meta_conversion?: number;
  meta_leads_trabajados?: number;
  activo?: boolean;
  notas?: string | null;
  last_login?: string | null;
  last_activity?: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
EOF;</div>xt-slate-100"ll rounded-lg border border-slate-700 bg-black px-3 py-2

VIRGINIA@DESKTOP-0F61TFG MINGW64 ~/desktop/concesionario-pro (main)
$ mkdir -p app/\(public\)/vehiculos

cat > app/\(public\)/vehiculos/page.tsx <<'EOF'
import { redirect } from "next/navigation";

export default function VehiculosIndexPage() {
  redirect("/#stock");
}
