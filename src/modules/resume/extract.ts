import type { ParsedFileMetadata } from "./types";
import { createRequire } from "node:module";

type ExtractResult = {
  rawText: string;
  metadata: ParsedFileMetadata;
};

const SUPPORTED_EXTENSIONS = ["pdf", "doc", "docx", "json"];

export function detectSource(filename: string, mimeType: string): ParsedFileMetadata["source"] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  if (ext === "json" || mimeType === "application/json") return "json";
  throw new Error(
    `Extensão não suportada. Suporte atual: ${SUPPORTED_EXTENSIONS.join(", ")}`
  );
}

/**
 * Placeholder de extração. Substituir por parsers reais:
 * - PDF: pdf-parse / pdfjs
 * - DOCX/DOC: mammoth / docx
 * - JSON: parse do conteúdo
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ExtractResult> {
  const source = detectSource(filename, mimeType);
  const size = buffer.byteLength;

  if (source === "pdf") {
    const rawText = await extractPdfText(buffer);
    return {
      rawText,
      metadata: { filename, mimeType, size, source }
    };
  }

  if (source === "json") {
    const asString = buffer.toString("utf-8");
    let parsed: unknown = asString;
    try {
      parsed = JSON.parse(asString);
    } catch {
      // Se não parsear, seguimos com string.
    }
    return {
      rawText: typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2),
      metadata: { filename, mimeType, size, source }
    };
  }

  // Para binários, devolvemos marcador.
  return {
    rawText: `<<texto extraído de ${filename} (${source}) - implementar parser real>>`,
    metadata: { filename, mimeType, size, source }
  };
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse") as (data: Buffer) => Promise<{ text?: string }>;
  const res = await pdfParse(buffer);
  const text = res.text?.trim() ?? "";
  return text || "<<Nenhum texto extraído do PDF>>";
}
