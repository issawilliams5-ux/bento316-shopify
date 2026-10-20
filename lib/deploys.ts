import { AuthError, type AuthedUser } from './auth';

// Deploy history for the hosted app, read from Render's API on the server.
// RENDER_API_KEY can redeploy and delete services, so it never leaves the server,
// and only emails listed in DEPLOY_ADMIN_EMAILS may see the page's data.

export type Deploy = { id: string; status: string; trigger: string; commitId: string; commitMessage: string; createdAt: string; finishedAt: string | null; url: string };

export class DeploysUnavailableError extends Error {
  readonly status = 503;
}

/** Throws unless the caller's email is on the allowlist. An empty list admits nobody. */
export function requireDeployAdmin(user: AuthedUser) {
  const admins = (process.env.DEPLOY_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!user.email || !admins.includes(user.email.toLowerCase())) throw new AuthError('Deploy status is limited to admins', 403);
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export async function listDeploys(limit = 20): Promise<Deploy[]> {
  const key = process.env.RENDER_API_KEY;
  const service = process.env.RENDER_SERVICE_ID;
  if (!key || !service) throw new DeploysUnavailableError('Set RENDER_API_KEY and RENDER_SERVICE_ID to show deploys');
  if (!/^srv-[a-z0-9]+$/i.test(service)) throw new DeploysUnavailableError('RENDER_SERVICE_ID should look like srv-…');

  const res = await fetch(`https://api.render.com/v1/services/${service}/deploys?limit=${limit}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new DeploysUnavailableError(`Render answered ${res.status}`);
  const body: unknown = await res.json();
  if (!Array.isArray(body)) throw new DeploysUnavailableError('Unexpected response from Render');

  return body.map((row) => {
    const d = (row as { deploy?: Record<string, unknown> })?.deploy ?? {};
    const commit = (d.commit ?? {}) as Record<string, unknown>;
    const id = str(d.id);
    return {
      id, status: str(d.status) || 'unknown', trigger: str(d.trigger),
      commitId: str(commit.id).slice(0, 7), commitMessage: str(commit.message).split('\n')[0],
      createdAt: str(d.createdAt), finishedAt: str(d.finishedAt) || null,
      url: `https://dashboard.render.com/web/${service}/deploys/${encodeURIComponent(id)}`,
    };
  });
}
