import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminArea =
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login";

  const isSellerArea =
    pathname.startsWith("/vendedor") &&
    pathname !== "/vendedor/login";

  if (isAdminArea) {
    const adminSession = req.cookies.get("admin_session")?.value;

    if (!adminSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isSellerArea) {
    const vendedorId = req.cookies.get("vendedor_id")?.value;

    if (!vendedorId) {
      const url = req.nextUrl.clone();
      url.pathname = "/vendedor/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendedor/:path*"],
};
