import { NextResponse } from "next/server";

export function proxy(request) {
  const token =
    request.cookies.get("access_token")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("jwt")?.value;

  const { pathname } = request.nextUrl;

  // 1. Protected routes (require authentication)
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  if (isProtectedRoute && !token) {
    const welcomeUrl = new URL("/welcome", request.url);
    return NextResponse.redirect(welcomeUrl);
  }

  // 2. Auth routes (redirect logged-in users away to dashboard)
  const isAuthRoute =
    pathname === "/" ||
    pathname === "/welcome" ||
    pathname.startsWith("/welcome/");

  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static assets (.svg, .png, .jpg, .jpeg, .gif, .webp, favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
