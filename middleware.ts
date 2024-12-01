import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Log middleware invocation
  console.log("Middleware invoked");

  // Get token from cookies
  const token = request.cookies.get("authToken")?.value;
  // console.log(token);
  // Define public routes (e.g., login or signup pages)
  const publicRoutes = ["/", "/login", "/signup"];

  // Skip middleware for public routes
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    console.log("Public route accessed:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Redirect to login page if no token is found
  if (!token) {
    console.log("No token found. Redirecting to login.");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Proceed to the requested route
  return NextResponse.next();
}

// Specify routes to apply middleware
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/request",
    "/request/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
