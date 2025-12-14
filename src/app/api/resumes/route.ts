import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const CreateSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  content: z.any()
});

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const templates = await prisma.template.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao listar currículos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateSchema.parse(body);

    const created = await prisma.template.create({
      data: {
        name: parsed.name,
        company: parsed.company,
        content: parsed.content,
        userId
      }
    });

    return NextResponse.json({ template: created });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar currículo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
