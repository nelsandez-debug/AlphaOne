import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Next.js 16 renamed the middleware file convention to proxy; the exported
// function still just gates requests before they reach a route. Per the
// Next.js data-security guide, this is a first line of defense only — every
// Server Function / route handler re-checks auth+permission itself
// (see requirePermission in src/lib/require-permission.ts), since a proxy
// matcher change could otherwise silently stop covering a route.
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
