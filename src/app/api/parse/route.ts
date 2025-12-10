import { NextResponse } from "next/server";
import { z } from "zod";
import { extractResumeWithLlm } from "@/modules/resume/llm";

export const runtime = "nodejs";

const BodySchema = z.object({
  text: z.string().min(1, "Texto obrigatório")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = BodySchema.parse(body);

    const result = await extractResumeWithLlm(text);

    return NextResponse.json({
      normalized: result.normalized,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
