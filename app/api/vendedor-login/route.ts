import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  if (!email || !password) {
    return NextResponse.json({ message: "Email y contraseña requeridos." }, { status: 400 });
  }

  const { data: vendedor, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  if (!vendedor || vendedor.activo === false) {
    return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
  }

  const stored = String(vendedor.passwrd || vendedor.password || "").trim();

  if (stored !== password) {
    return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, vendedor });

  res.cookies.set("vendedor_id", String(vendedor.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
