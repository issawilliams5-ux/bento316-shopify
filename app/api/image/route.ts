import { NextResponse } from 'next/server';
import { QwenImageError, generateImage, parseImageRequest } from '@/lib/qwen-image';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => { throw new QwenImageError('Invalid JSON body', 400); });
    const image = await generateImage(parseImageRequest(body));
    return NextResponse.json(image);
  } catch (error) {
    if (error instanceof QwenImageError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Image generation failed', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
