import { z } from "zod";
import type { ParsedFileMetadata, ResumeNormalized } from "./types";

export const ImportSchema = z.object({
  metadata: z.object({
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().nonnegative(),
    source: z.enum(["pdf", "docx", "doc", "json"])
  }),
  text: z.string().min(1, "Texto extraído vazio")
});

export type ImportPayload = z.infer<typeof ImportSchema>;

/**
 * Entrada principal para lidar com texto extraído antes de chamar LLM.
 * A ideia é normalizar o mínimo possível aqui e deixar a LLM completar.
 */
export async function ingestImportedText(
  payload: ImportPayload
): Promise<{ normalized: ResumeNormalized; rawText: string }> {
  const parsed = ImportSchema.parse(payload);

  // TODO: implementar pré-processamento (ex.: remover espaçamentos e headers).
  const normalized: ResumeNormalized = {
    contact: {},
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    summary: undefined
  };

  return { normalized, rawText: parsed.text };
}

export function summarizeMetadata(meta: ParsedFileMetadata) {
  return `${meta.filename} (${meta.mimeType}, ${Math.round(meta.size / 1024)} KB)`;
}
