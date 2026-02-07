import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Redirect to onboarding if not completed
    if (!token.onboardingCompleted && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // Protect onboarding route
  if (pathname.startsWith("/onboarding")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // If onboarding is already done, go to dashboard
    if (token.onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users from landing page
  if (pathname === "/") {
    if (token) {
      if (!token.onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/onboarding/:path*"],
};
