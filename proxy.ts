import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "admin_session";
const SELLER_COOKIE = "seller_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ======================
  // ADMIN
  // ======================
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

    const token = req.cookies.get(ADMIN_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ======================
  // VENDEDOR
  // ======================
  if (pathname.startsWith("/vendedor")) {
    const token = req.cookies.get(SELLER_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL("/vendedor/login", req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendedor/:path*"],
};
