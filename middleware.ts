import { auth } from "@/lib/auth/options";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (!session.user.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // Protect onboarding route
  if (pathname.startsWith("/onboarding")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (session.user.onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect authenticated users from landing page
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(
        new URL(
          session.user.onboardingCompleted ? "/dashboard" : "/onboarding",
          req.url
        )
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard/:path*", "/onboarding/:path*"],
};
