import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SELLER_COOKIE = "seller_session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Faltan credenciales." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .select("id, nombre, email, password, activo")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    if (!data.activo) {
      return NextResponse.json(
        { ok: false, message: "Vendedor inactivo." },
        { status: 403 }
      );
    }

    if (data.password !== password) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      vendedor: {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
      },
    });

    res.cookies.set(SELLER_COOKIE, data.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (err) {
    console.error("POST /api/vendedor-login error", err);
    return NextResponse.json(
      { ok: false, message: "Error interno." },
      { status: 500 }
    );
  }
}
