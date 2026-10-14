import { NextResponse } from 'next/server';
import { AuthError, requireUser } from '@/lib/auth';
import { LegalReviewError, parseLegalRequest, reviewDocument } from '@/lib/legal';
import { LEGAL_EVENT_TYPE, RateLimitError, enforceRateLimit } from '@/lib/rate-limit';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => { throw new LegalReviewError('Invalid JSON body', 400); });
    const { mode, text } = parseLegalRequest(body);

    await enforceRateLimit(user.id, LEGAL_EVENT_TYPE);

    const review = await reviewDocument(mode, text);
    // Log sizes only: documents can contain personal or confidential data.
    console.info('Legal review', { userId: user.id, mode, chars: text.length, issues: review.issues.length });
    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: { 'Retry-After': String(error.retryAfterSeconds) } });
    }
    if (error instanceof LegalReviewError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Legal review failed', error);
    return NextResponse.json({ error: 'Legal review failed' }, { status: 500 });
  }
}
