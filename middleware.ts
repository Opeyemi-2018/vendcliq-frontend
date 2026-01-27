// In middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/forget-password/otp",
    "/forget-password/reset",
  ];

  // Allow public routes
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check for valid token in BOTH sources
  let hasValidAuth = false;

  // 1. Check cookie (for server-side auth)
  const cookieToken = request.cookies.get("authToken")?.value;
  if (cookieToken) {
    hasValidAuth = true;
  }

  // 2. Check for Authorization header (for client-side auth)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token) {
      hasValidAuth = true;
    }
  }

  // 3. **CRITICAL FIX**: Check request headers for client-side token indicator
  // When user clicks back button or manually enters URL, the browser
  // might still have localStorage token. We need to detect this.
  const clientTokenIndicator = request.headers.get("x-client-token-check");
  if (clientTokenIndicator === "true") {
    // This indicates the client-side axios interceptor added a token
    // We'll rely on API calls to fail if token is invalid
    hasValidAuth = true;
  }

  // If no valid auth found → redirect to signin with force-clear flag
  if (!hasValidAuth) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    url.searchParams.set("forceClear", "true"); // Add flag for client-side cleanup

    const response = NextResponse.redirect(url);

    // Add headers to prevent caching
    response.headers.set("Cache-Control", "no-store, max-age=0");

    return response;
  }

  // Add cache control to prevent browser from caching protected pages
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  return response;
}

export const config = {
  matcher: [
    "/dashboards/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/request/:path*",
  ],
};
