// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  // Public routes - no auth needed
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/forget-password/otp",
    "/forget-password/reset",
  ];

  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // If no auth token → redirect to signin
  if (!token) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Token exists → allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboards/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/request/:path*",
  ],
};
