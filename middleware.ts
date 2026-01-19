// middleware.ts (create this file in your project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("authToken")?.value;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/signin") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboards");

  // If trying to access dashboard without token, redirect to signin
  if (isDashboardPage && !token) {
    const signInUrl = new URL("/signin", request.url);
    const response = NextResponse.redirect(signInUrl);

    // Prevent caching of protected pages
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  }

  // If trying to access auth pages with token, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(
      new URL("/dashboards/account/overview", request.url)
    );
  }

  // Add cache prevention headers for all dashboard pages
  if (isDashboardPage) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboards/:path*",
    "/dashboards/:path*",
    "/signin",
    "/signup",
    "/forgot-password",
  ],
};
