// Qwen-Image client. Two backends behind one call:
//
//   'self-hosted' — an OpenAI-compatible images endpoint you run
//                   (vLLM-Omni `vllm serve Qwen/Qwen-Image-2.1 --omni`,
//                   or SGLang). Needs a GPU; gives you Qwen-Image-2.1.
//   'fal'         — fal.ai's hosted Qwen Image 2.0. No GPU, pay per image.
//                   Note 2.0, not 2.1: fal does not host 2.1 at time of
//                   writing, so transparency and 10-image references are
//                   self-hosted only.
//
// Nothing here runs a model. Pick a backend with QWEN_IMAGE_PROVIDER, or
// leave it unset and whichever one is configured is used.

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

export type Provider = 'self-hosted' | 'fal';

/** Explicit env wins; otherwise whichever backend has credentials. */
export function resolveProvider(): Provider | null {
  const explicit = process.env.QWEN_IMAGE_PROVIDER?.trim().toLowerCase();
  if (explicit === 'fal' || explicit === 'self-hosted') return explicit;
  if (explicit) throw new QwenImageError(`Unknown QWEN_IMAGE_PROVIDER: ${explicit}`, 503);
  if (process.env.QWEN_IMAGE_BASE_URL) return 'self-hosted';
  if (process.env.FAL_KEY) return 'fal';
  return null;
}

export const isQwenImageConfigured = Boolean(process.env.QWEN_IMAGE_BASE_URL || process.env.FAL_KEY);

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
  const provider = resolveProvider();
  if (!provider) {
    throw new QwenImageError('No image backend configured: set FAL_KEY or QWEN_IMAGE_BASE_URL', 503);
  }

  const [width, height] = ASPECT_RATIOS[request.aspectRatio ?? '1:1'];
  const b64 = provider === 'fal'
    ? await generateViaFal(request, width, height)
    : await generateViaSelfHosted(request, width, height);

  return { b64, width, height };
}

/** Wraps fetch so every backend reports unreachable and slow the same way. */
async function post(url: string, headers: Record<string, string>, body: unknown) {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify(body),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    throw new QwenImageError(timedOut ? 'Image generation timed out' : 'Could not reach the image backend', 504);
  }
}

/** The upstream body can carry server internals — log it, never return it. */
async function assertOk(response: Response, label: string) {
  if (response.ok) return;
  console.error(`${label} upstream error`, response.status, await response.text().catch(() => ''));
  throw new QwenImageError(`Image generation failed upstream (${response.status})`);
}

async function generateViaSelfHosted(request: ImageRequest, width: number, height: number) {
  const base = process.env.QWEN_IMAGE_BASE_URL;
  if (!base) throw new QwenImageError('QWEN_IMAGE_BASE_URL is not set', 503);

  const headers: Record<string, string> = {};
  if (process.env.QWEN_IMAGE_API_KEY) headers.Authorization = `Bearer ${process.env.QWEN_IMAGE_API_KEY}`;

  const response = await post(`${base.replace(/\/+$/, '')}/v1/images/generations`, headers, {
    model: process.env.QWEN_IMAGE_MODEL || 'Qwen/Qwen-Image-2.1',
    prompt: buildPrompt(request),
    size: `${width}x${height}`,
    num_inference_steps: request.steps,
    response_format: 'b64_json',
    n: 1,
    ...(request.transparent ? { color_format: 'RGBA' } : {}),
    ...(request.seed === undefined ? {} : { seed: request.seed }),
  });
  await assertOk(response, 'Qwen-Image');

  const payload = await response.json().catch(() => null) as { data?: { b64_json?: string }[] } | null;
  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) throw new QwenImageError('Qwen-Image server returned no image data');
  return b64;
}

// Read per call, not at module load: a module-level const freezes whatever
// the environment held at import time.
const falModel = () => process.env.FAL_IMAGE_MODEL || 'fal-ai/qwen-image-2/text-to-image';
// Overridable so the client can be pointed at a stand-in under test.
const falBase = () => (process.env.FAL_BASE_URL || 'https://fal.run').replace(/\/+$/, '');

async function generateViaFal(request: ImageRequest, width: number, height: number) {
  const key = process.env.FAL_KEY;
  if (!key) throw new QwenImageError('FAL_KEY is not set', 503);

  // fal's synchronous route. sync_mode asks it to inline the image rather
  // than hand back a CDN link, but it is a hint, not a guarantee — the
  // reader below handles both.
  const response = await post(`${falBase()}/${falModel()}`, { Authorization: `Key ${key}` }, {
    prompt: buildPrompt(request),
    image_size: { width, height },
    num_inference_steps: request.steps,
    num_images: 1,
    output_format: 'png',
    sync_mode: true,
    ...(request.seed === undefined ? {} : { seed: request.seed }),
  });
  await assertOk(response, 'fal');

  const payload = await response.json().catch(() => null) as { images?: { url?: string }[] } | null;
  const url = payload?.images?.[0]?.url;
  if (!url) throw new QwenImageError('fal returned no image');
  return readImage(url);
}

/** fal hands back either a data: URI or a CDN link. Normalise both to base64. */
async function readImage(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    const b64 = url.split(',')[1];
    if (!b64) throw new QwenImageError('fal returned a malformed data URI');
    return b64;
  }

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new QwenImageError('Could not download the generated image', 504);
  }
  await assertOk(response, 'fal image download');
  return Buffer.from(await response.arrayBuffer()).toString('base64');
}
