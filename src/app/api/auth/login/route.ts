import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, setAuthCookies, signAccessToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = BodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const { token: refreshToken } = await createSession(user.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? undefined
    });

    const res = NextResponse.json({ ok: true, email: user.email });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao autenticar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
