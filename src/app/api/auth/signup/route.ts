import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, setAuthCookies, signAccessToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = BodySchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed
      }
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const { token: refreshToken } = await createSession(user.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? undefined
    });

    const res = NextResponse.json({ ok: true, email: user.email });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao cadastrar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
