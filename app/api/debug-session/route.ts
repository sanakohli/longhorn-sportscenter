import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll().map((c) => c.name);

  const secretA = process.env.AUTH_SECRET;
  const secretN = process.env.NEXTAUTH_SECRET;

  // Try with AUTH_SECRET
  let tokenA = null;
  try {
    tokenA = await getToken({ req: request, secret: secretA });
  } catch (e: unknown) {
    tokenA = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Try with NEXTAUTH_SECRET
  let tokenN = null;
  try {
    tokenN = await getToken({ req: request, secret: secretN });
  } catch (e: unknown) {
    tokenN = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Try with v4-style cookie name
  let tokenV4 = null;
  try {
    tokenV4 = await getToken({
      req: request,
      secret: secretA,
      salt: "__Secure-next-auth.session-token",
    });
  } catch (e: unknown) {
    tokenV4 = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    allCookies: cookies,
    hasSessionCookie_v5: cookies.some((c) => c.includes("authjs.session-token")),
    hasSessionCookie_v4: cookies.some((c) => c.includes("next-auth.session-token")),
    tokenWithAuthSecret: tokenA ? "found" : "null",
    tokenWithNextAuthSecret: tokenN ? "found" : "null",
    tokenWithV4Salt: tokenV4 ? "found" : "null",
    secretsMatch: secretA === secretN,
  });
}
