import { NextResponse } from "next/server";
import { rotateSession, parseRefreshToken, setAuthCookies, signAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const refreshCookie = req.headers.get("cookie")?.split(";").find((c) => c.trim().startsWith("refresh_token="));
    const cookieValue = refreshCookie ? decodeURIComponent(refreshCookie.split("=")[1]) : undefined;
    const parsed = parseRefreshToken(cookieValue);
    if (!parsed) {
      return NextResponse.json({ error: "Refresh token ausente" }, { status: 401 });
    }

    const rotated = await rotateSession(parsed.sessionId, parsed.token);
    if (!rotated) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: rotated.session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    const accessToken = signAccessToken({ sub: rotated.session.userId, email: user.email });

    const res = NextResponse.json({ ok: true });
    setAuthCookies(res, accessToken, rotated.token);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao renovar sessão";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
