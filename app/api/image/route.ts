import { NextResponse } from 'next/server';
import { AuthError, requireUser } from '@/lib/auth';
import { QwenImageError, generateImage, parseImageRequest } from '@/lib/qwen-image';
import { RateLimitError, enforceImageRateLimit } from '@/lib/rate-limit';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => { throw new QwenImageError('Invalid JSON body', 400); });
    const imageRequest = parseImageRequest(body);

    await enforceImageRateLimit(user.id);

    const image = await generateImage(imageRequest);
    console.info('Generated image', { userId: user.id, bytes: image.b64.length });
    return NextResponse.json(image);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: { 'Retry-After': String(error.retryAfterSeconds) } });
    }
    if (error instanceof QwenImageError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Image generation failed', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
