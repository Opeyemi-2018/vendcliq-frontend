// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  const userRole = request.cookies.get("userRole")?.value;
  const isAttendant = userRole === "ATTENDANTS";

  // === ATTENDANT: hard-blocked routes (regardless of permissions) ===
  const attendantBlockedPrefixes = [
    "/account",
    "/credit-ledger",
    "/delivery",
    "/my-purchase",
    "/payment-subscription",
    "/plans",
    // "/referral",
    "/request-account-deletion",
  ];

  if (isAttendant) {
    const isHardBlocked = attendantBlockedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
    if (isHardBlocked) {
      return NextResponse.redirect(new URL("/inventory/overview", request.url));
    }
  }

  // === PERMISSION-BASED ROUTE GUARDS ===
  // Store permissions as a comma-separated cookie on login, e.g.:
  // "canSell,canBuy,canReporting"
  const permsCookie = request.cookies.get("userPermissions")?.value ?? "";
  const permissions = new Set(permsCookie.split(",").filter(Boolean));

  const permissionRoutes: Array<{ prefix: string; perm: string }> = [
    { prefix: "/inventory/sell", perm: "canSell" },
    { prefix: "/inventory/buy",  perm: "canBuy" },
    { prefix: "/expenses",        perm: "canExpenses" },
    { prefix: "/business-report", perm: "canReporting" },
    { prefix: "/market-place",    perm: "canAccessMarketplace" },
  ];

  for (const { prefix, perm } of permissionRoutes) {
    const matches = pathname === prefix || pathname.startsWith(prefix + "/");
    if (matches && !permissions.has(perm)) {
      return NextResponse.redirect(new URL("/inventory/overview", request.url));
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