import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const ACCESS_TOKEN_TTL_SEC = 60 * 15; // 15 minutos
const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 30; // 30 dias

export function signAccessToken(payload: { sub: string | number; email: string }) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurada");
  return jwt.sign({ ...payload, sub: String(payload.sub) }, secret, { expiresIn: ACCESS_TOKEN_TTL_SEC });
}

export async function verifyAccessToken(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurada");
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const res = await jwtVerify(token, key);
  return res.payload as { sub?: string; email?: string };
}

export async function createSession(userId: number, meta?: { userAgent?: string; ip?: string }) {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(raw, 10);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt,
      userAgent: meta?.userAgent,
      ip: meta?.ip
    }
  });

  const token = `${session.id}:${raw}`;
  return { session, token };
}

export async function rotateSession(sessionId: string, rawToken: string) {
  const sessionIdNum = Number(sessionId);
  if (!Number.isFinite(sessionIdNum)) return null;

  const session = await prisma.session.findUnique({ where: { id: sessionIdNum } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  const match = await bcrypt.compare(rawToken, session.tokenHash);
  if (!match) {
    await prisma.session.update({
      where: { id: sessionIdNum },
      data: { revokedAt: new Date() }
    });
    return null;
  }

  const newRaw = crypto.randomBytes(32).toString("hex");
  const newHash = await bcrypt.hash(newRaw, 10);
  const newExpires = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);

  const updated = await prisma.session.update({
    where: { id: sessionIdNum },
    data: {
      tokenHash: newHash,
      expiresAt: newExpires
    }
  });

  return { session: updated, token: `${updated.id}:${newRaw}` };
}

export async function revokeSession(sessionId: string) {
  const sessionIdNum = Number(sessionId);
  if (!Number.isFinite(sessionIdNum)) return;
  await prisma.session.updateMany({
    where: { id: sessionIdNum, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export function parseRefreshToken(cookieValue?: string | null) {
  if (!cookieValue) return null;
  const [sessionId, token] = cookieValue.split(":");
  if (!sessionId || !token) return null;
  return { sessionId, token };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const accessMaxAge = ACCESS_TOKEN_TTL_SEC;
  const refreshMaxAge = REFRESH_TOKEN_TTL_SEC;

  // @ts-expect-error NextResponse cookies available em runtime Next
  res.cookies.set("auth_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge
  });

  // @ts-expect-error NextResponse cookies available em runtime Next
  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAge
  });
}

export async function getUserIdFromRequest(req: Request) {
  const token = req.headers.get("cookie")?.split(";").find((c) => c.trim().startsWith("auth_token="));
  const tokenValue = token ? decodeURIComponent(token.split("=")[1]) : undefined;
  if (!tokenValue) return null;
  const payload = await verifyAccessToken(tokenValue).catch(() => null);
  if (!payload?.sub) return null;
  const id = Number(payload.sub);
  return Number.isFinite(id) ? id : null;
}
