import { NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/modules/resume/extract";
import type { ParsedFileMetadata } from "@/modules/resume/types";
import { storeBufferLocally } from "@/modules/storage/blob";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB para placeholder

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo no campo 'file'." }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${MAX_SIZE_BYTES / (1024 * 1024)}MB.` },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "application/octet-stream";
    const filename = file.name || "upload.bin";

    const { rawText, metadata } = await extractTextFromBuffer(buffer, filename, mimeType);

    const blobRef = await storeBufferLocally(buffer, filename, mimeType);

    const responsePayload: {
      file: ParsedFileMetadata;
      storage: { id: string; path: string };
      rawTextPreview: string;
      rawTextLength: number;
    } = {
      file: metadata,
      storage: { id: blobRef.id, path: blobRef.path },
      rawTextPreview: rawText.slice(0, 800),
      rawTextLength: rawText.length
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
