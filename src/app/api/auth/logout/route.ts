import { NextResponse } from "next/server";
import { parseRefreshToken, revokeSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const refreshCookie = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("refresh_token="));
  const cookieValue = refreshCookie ? decodeURIComponent(refreshCookie.split("=")[1]) : undefined;
  const parsed = parseRefreshToken(cookieValue);
  if (parsed) {
    await revokeSession(parsed.sessionId);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  res.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return res;
}
