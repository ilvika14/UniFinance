import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 60000;

function isRateLimitError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  if (status === 429) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("rate") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

function getRetryDelay(error: unknown, attempt: number): number {
  const retryAfter = (error as { headers?: Record<string, string> })?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  const msg = error instanceof Error ? error.message : String(error);
  const retryMatch = msg.match(/retry(?:[_-])?after[":\s]+(\d+\.?\d*)s?/i);
  if (retryMatch) {
    return Math.ceil(parseFloat(retryMatch[1]) * 1000);
  }
  return BASE_DELAY_MS * Math.pow(2, attempt);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateContentWithRetry(
  model: string,
  prompt: string,
  retries = MAX_RETRIES
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 1,
        max_completion_tokens: 4096,
        top_p: 1,
      });

      return completion.choices[0]?.message?.content ?? "";
    } catch (error) {
      lastError = error;

      if (attempt < retries && isRateLimitError(error)) {
        const delay = getRetryDelay(error, attempt);
        console.warn(
          `[Groq] Rate limited (attempt ${attempt + 1}/${retries + 1}). Retrying in ${Math.round(delay / 1000)}s...`
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function generateVisionWithRetry(
  model: string,
  base64Image: string,
  mimeType: string,
  prompt: string,
  retries = MAX_RETRIES
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
      });

      return completion.choices[0]?.message?.content ?? "";
    } catch (error) {
      lastError = error;

      if (attempt < retries && isRateLimitError(error)) {
        const delay = getRetryDelay(error, attempt);
        console.warn(
          `[Groq] Rate limited (attempt ${attempt + 1}/${retries + 1}). Retrying in ${Math.round(delay / 1000)}s...`
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}
