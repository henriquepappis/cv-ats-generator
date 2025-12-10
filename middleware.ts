import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/health",
  "/favicon.ico",
  "/robots.txt"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir assets e públicos
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  const secret = process.env.AUTH_SECRET;

  if (!token || !secret) {
    return handleUnauthorized(req);
  }

  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    await jwtVerify(token, key);
    return NextResponse.next();
  } catch {
    return handleUnauthorized(req);
  }
}

function handleUnauthorized(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
