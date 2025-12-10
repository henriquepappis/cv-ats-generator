import { NextResponse } from "next/server";
import { z } from "zod";
import { ResumeSchema } from "@/modules/resume/schema";
import { renderResumePdf } from "@/modules/resume/pdf";
import "server-only";

export const runtime = "nodejs";

const BodySchema = z.object({
  resume: ResumeSchema
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume } = BodySchema.parse(body);
    const pdfBuffer = await renderResumePdf(resume);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
