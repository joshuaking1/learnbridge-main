import { clerkMiddleware } from "@clerk/nextjs/server";

// Use the clerkMiddleware from Clerk
export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  const isPublicRoute = [
    "/",
    "/sign-in",
    "/sign-up",
    "/register",
    "/login",
    "/api",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ].some((route) => req.nextUrl.pathname.startsWith(route));

  if (!isPublicRoute) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|static|.*\\..*).*)",
  ],
};
