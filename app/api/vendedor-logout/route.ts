import { NextResponse } from "next/server";

const SELLER_COOKIE = "seller_session";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set(SELLER_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
