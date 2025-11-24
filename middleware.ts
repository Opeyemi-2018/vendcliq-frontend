import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Log middleware invocation
  // console.log("Middleware invoked");

  // Get tokens from cookies
  const accessToken = request.cookies.get("authToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Define public routes (e.g., signin or signup pages)
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/forget-password/otp",
    "/forget-password/reset",
  ];

  // Skip middleware for public routes
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    // console.log("Public route accessed:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  // If no tokens found, redirect to signin
  if (!accessToken && !refreshToken) {
    // console.log("No tokens found. Redirecting to signin.");
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If access token expired but refresh token exists
  if (!accessToken && refreshToken) {
    // Call refresh token endpoint
    try {
      const response = NextResponse.next();
      response.cookies.set("authToken", "new_access_token"); // Set new access token
      return response;
    } catch (error) {
      // If refresh fails, redirect to signin
      // console.log("Token refresh failed. Redirecting to signin.");
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  // Proceed with valid access token
  return NextResponse.next();
}

// Specify routes to apply middleware
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$).*)",
    "/request",
    "/request/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
