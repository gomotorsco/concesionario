import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Faltan credenciales." },
        { status: 400 }
      );
    }

    const email = String(body.email).trim();
    const password = String(body.password);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL o ADMIN_PASSWORD no configurados.");
      return NextResponse.json(
        { error: "Configuración de admin incompleta en el servidor." },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    // Si quisieras setear cookie propia, aquí.
    return NextResponse.json(
      { ok: true, user: { email: adminEmail } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error en /api/auth/login:", err);
    return NextResponse.json(
      { error: "Error interno en el login." },
      { status: 500 }
    );
  }
}
