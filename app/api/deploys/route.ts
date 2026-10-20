import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-errors';
import { requireUser } from '@/lib/auth';
import { DeploysUnavailableError, listDeploys, requireDeployAdmin } from '@/lib/deploys';

/** GET -> { deploys }: recent Render deploys of the app, for admins only. */
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireDeployAdmin(user);
    return NextResponse.json({ deploys: await listDeploys() });
  } catch (error) {
    if (error instanceof DeploysUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 });
    return errorResponse(error, 'Loading deploys failed');
  }
}
