import { NextResponse } from 'next/server';
import { AuthError } from './auth';
import { InputError } from './pack';
import { NotFoundError } from './pack-store';
import { RateLimitError } from './rate-limit';

/** Maps known errors to their status; anything else is logged and returned as a generic 500. */
export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof RateLimitError) {
    return NextResponse.json({ error: error.message }, { status: error.status, headers: { 'Retry-After': String(error.retryAfterSeconds) } });
  }
  if (error instanceof AuthError || error instanceof InputError || error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
