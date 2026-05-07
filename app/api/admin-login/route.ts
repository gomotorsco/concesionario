import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { message: "Faltan ADMIN_EMAIL o ADMIN_PASSWORD en Vercel." },
      { status: 500 }
    );
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("admin_session", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
