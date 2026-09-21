// Qwen-Image-2.1 client. Talks to a self-hosted OpenAI-compatible images
// endpoint (vLLM-Omni `vllm serve Qwen/Qwen-Image-2.1 --omni`, or SGLang).
// Nothing here runs the model — QWEN_IMAGE_BASE_URL must point at your server.

// Native 2K sizes the model was trained on; anything else degrades text rendering.
export const ASPECT_RATIOS = {
  '1:1': [2048, 2048], '4:3': [2400, 1792], '3:4': [1792, 2400],
  '3:2': [2528, 1696], '2:3': [1696, 2528], '16:9': [2752, 1536], '9:16': [1536, 2752],
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

export type ImageRequest = {
  prompt: string;
  aspectRatio?: AspectRatio;
  steps?: number;
  seed?: number;
  transparent?: boolean;
};

export type GeneratedImage = { b64: string; width: number; height: number };

export const PROMPT_MAX = 4000;
const DEFAULT_STEPS = 40;
const TIMEOUT_MS = Number(process.env.QWEN_IMAGE_TIMEOUT_MS) || 180_000;

export const isQwenImageConfigured = Boolean(process.env.QWEN_IMAGE_BASE_URL);

export class QwenImageError extends Error {
  constructor(message: string, readonly status = 502) { super(message); }
}

/**
 * Validates untrusted input (an API route hands us raw JSON) and returns a
 * normalised request. Throws QwenImageError with a 400 on bad input.
 */
export function parseImageRequest(body: unknown): ImageRequest {
  const input = (body ?? {}) as Record<string, unknown>;
  const bad = (msg: string) => { throw new QwenImageError(msg, 400); };

  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!prompt) bad('prompt is required');
  if (prompt.length > PROMPT_MAX) bad(`prompt exceeds ${PROMPT_MAX} characters`);

  const aspectRatio = input.aspectRatio === undefined ? '1:1' : input.aspectRatio;
  // hasOwn, not `in`: `in` walks the prototype chain, so 'toString' and
  // 'constructor' would pass here and blow up as a 500 further down.
  if (typeof aspectRatio !== 'string' || !Object.hasOwn(ASPECT_RATIOS, aspectRatio)) {
    bad(`aspectRatio must be one of ${Object.keys(ASPECT_RATIOS).join(', ')}`);
  }

  let steps = DEFAULT_STEPS;
  if (input.steps !== undefined) {
    if (!Number.isInteger(input.steps) || (input.steps as number) < 1 || (input.steps as number) > 100) {
      bad('steps must be an integer between 1 and 100');
    }
    steps = input.steps as number;
  }

  let seed: number | undefined;
  if (input.seed !== undefined) {
    if (!Number.isInteger(input.seed) || (input.seed as number) < 0 || (input.seed as number) > 2_147_483_647) {
      bad('seed must be an integer between 0 and 2147483647');
    }
    seed = input.seed as number;
  }

  if (input.transparent !== undefined && typeof input.transparent !== 'boolean') {
    bad('transparent must be a boolean');
  }

  return { prompt, aspectRatio: aspectRatio as AspectRatio, steps, seed, transparent: Boolean(input.transparent) };
}

// The RGBA wrapper the model card specifies; without it transparency is unreliable.
function buildPrompt({ prompt, transparent }: ImageRequest) {
  return transparent
    ? `This is an RGBA image with transparency. ${prompt}. The image has alpha channel and the background is transparent.`
    : prompt;
}

export async function generateImage(request: ImageRequest): Promise<GeneratedImage> {
  const base = process.env.QWEN_IMAGE_BASE_URL;
  if (!base) throw new QwenImageError('QWEN_IMAGE_BASE_URL is not set', 503);

  const [width, height] = ASPECT_RATIOS[request.aspectRatio ?? '1:1'];
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.QWEN_IMAGE_API_KEY) headers.Authorization = `Bearer ${process.env.QWEN_IMAGE_API_KEY}`;

  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/+$/, '')}/v1/images/generations`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.QWEN_IMAGE_MODEL || 'Qwen/Qwen-Image-2.1',
        prompt: buildPrompt(request),
        size: `${width}x${height}`,
        num_inference_steps: request.steps,
        response_format: 'b64_json',
        n: 1,
        ...(request.transparent ? { color_format: 'RGBA' } : {}),
        ...(request.seed === undefined ? {} : { seed: request.seed }),
      }),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    throw new QwenImageError(timedOut ? 'Image generation timed out' : 'Could not reach the Qwen-Image server', 504);
  }

  if (!response.ok) {
    // The upstream body can carry server internals — log it, don't return it.
    console.error('Qwen-Image upstream error', response.status, await response.text().catch(() => ''));
    throw new QwenImageError(`Image generation failed upstream (${response.status})`);
  }

  const payload = await response.json().catch(() => null) as { data?: { b64_json?: string }[] } | null;
  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) throw new QwenImageError('Qwen-Image server returned no image data');

  return { b64, width, height };
}
