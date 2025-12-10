import { chatCompletion } from "@/modules/openai/client";
import { ResumeNormalizedSchema, type ResumeNormalizedInput } from "./schema";

type LlmResult = {
  normalized: ResumeNormalizedInput;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

const SYSTEM_PROMPT = `
Você é um parser de currículos. Extraia o máximo de campos estruturados, retornando estritamente JSON no schema fornecido.
Preencha apenas o que estiver presente; não invente.
Campos de datas podem ser texto (ex.: "2019-05", "2019", "Atual").
`.trim();

const USER_INSTRUCTIONS = `
Retorne estritamente JSON válido seguindo o schema (sem \`markdown\`, sem \`codigo\`):
{
  "contact": { "fullName": string?, "email": string?, "phone": string?, "location": string?, "links": string[]? },
  "experiences": [
    { "company": string?, "role": string?, "startDate": string?, "endDate": string?, "summary": string?, "highlights": string[]?, "location": string? }
  ],
  "education": [
    { "institution": string?, "degree": string?, "startDate": string?, "endDate": string?, "details": string?, "location": string? }
  ],
  "skills": [ { "name": string, "level": "beginner"|"intermediate"|"advanced"|"expert"?, "keywords": string[]? } ],
  "languages": [ { "name": string, "proficiency": "basic"|"conversational"|"professional"|"native"? } ],
  "summary": string?
}
`.trim();

export async function extractResumeWithLlm(rawText: string): Promise<LlmResult> {
  if (!rawText.trim()) {
    throw new Error("Texto vazio para extração");
  }

  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${USER_INSTRUCTIONS}\n\nTexto do currículo:\n${rawText}` }
    ],
    { temperature: 0 }
  );

  const parsed = safeJson(response.content);
  const normalized = ResumeNormalizedSchema.parse(parsed);

  return {
    normalized,
    model: response.model,
    usage: response.usage
  };
}

function safeJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // tenta extrair primeiro bloco JSON
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error("Resposta da LLM não é JSON válido");
  }
}
