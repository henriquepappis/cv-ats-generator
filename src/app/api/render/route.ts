import { NextResponse } from "next/server";
import { z } from "zod";
import { ResumeSchema } from "@/modules/resume/schema";
import { renderResumeHtml } from "@/modules/resume/template";

export const runtime = "nodejs";

const BodySchema = z.object({
  resume: ResumeSchema
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume } = BodySchema.parse(body);
    const html = renderResumeHtml(resume);

    return NextResponse.json({ html });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
