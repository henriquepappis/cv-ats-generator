type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

type ChatResponse = {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    costInUsd?: number;
  };
};

/**
 * Cliente mínimo usando fetch para evitar dependências do SDK.
 * Substitua por @ai-sdk/openai ou openai oficial se preferir.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada");
  }

  const body = {
    model: options.model ?? "gpt-4o-mini",
    messages,
    temperature: options.temperature ?? 0,
    max_tokens: options.maxTokens
  };

  const res = await fetch(
    `${process.env.OPENAI_BASE_URL ?? "https://api.openai.com"}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${errorText}`);
  }

  const json = await res.json();
  const choice = json.choices?.[0]?.message?.content ?? "";
  const usage = json.usage ?? {};

  return {
    content: choice,
    model: json.model,
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens
    }
  };
}
