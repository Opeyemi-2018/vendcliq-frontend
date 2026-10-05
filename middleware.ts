// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ATTENDANT_HOME,
  DENIED_PARAM,
  PERMISSIONS_COOKIE,
  parsePermissionsCookie,
  ruleForPath,
} from "@/lib/access/attendantAccess";

export function middleware(request: NextRequest) {
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/forget-password/otp",
    "/forget-password/reset",
  ];

  const pathname = request.nextUrl.pathname;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // === AUTH CHECK ===
  const cookieToken = request.cookies.get("authToken")?.value;
  const accessTokenCookie = request.cookies.get("accessToken")?.value;
  const authHeader = request.headers.get("authorization");
  const hasValidAuth =
    !!(cookieToken || accessTokenCookie || authHeader?.startsWith("Bearer "));

  if (!hasValidAuth) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    url.searchParams.set("forceClear", "true");
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  // === ATTENDANT RULES (lib/access/attendantAccess — same as the app) ===
  // Owners pass every check. Attendants need the permission flag; the
  // cookie is written at sign-in and refreshed by the client guard.
  const userRole = request.cookies.get("userRole")?.value;
  if (userRole === "ATTENDANTS") {
    const permissions = parsePermissionsCookie(
      request.cookies.get(PERMISSIONS_COOKIE)?.value,
    );
    const rule = ruleForPath(pathname);
    if (rule && !rule.allow({ isAttendant: true, permissions })) {
      const url = new URL(ATTENDANT_HOME, request.url);
      url.searchParams.set(DENIED_PARAM, rule.feature);
      return NextResponse.redirect(url);
    }
  }

  // === PASS THROUGH ===
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/add-purchase/:path*",
    "/business-account/:path*",
    "/business-settings/:path*",
    "/cart/:path*",
    "/loan/:path*",
    "/loans/:path*",
    "/credit-ledger/:path*",
    "/delivery/:path*",
    "/my-purchase/:path*",
    "/payment-subscription/:path*",
    "/plans/:path*",
    "/referral/:path*",
    "/request-account-deletion/:path*",
    "/inventory/:path*",
    "/expenses/:path*",
    "/business-report/:path*",
    "/market-place/:path*",
    "/suppliers/:path*",
    "/customer/:path*",
    "/profile-settings/:path*",
  ],
};