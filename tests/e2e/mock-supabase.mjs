// Local stand-in for the Supabase auth endpoints that AuthForm and AuthGate call.
// Test-only: it answers by email/password so each auth outcome can be exercised.
//   taken@example.com    signup -> 422 user already registered
//   instant@example.com  signup -> session (email confirmation off)
//   any other email      signup -> user without session (confirmation required)
//   password "wrong-password" on login -> 400 invalid credentials
//   down@example.com     -> connection dropped (service unreachable)
// It also keeps an in-memory table store behind /rest/v1/<table> with just the
// PostgREST the app uses: eq./gte. filters, order, insert/update/delete and
// single-object responses. There is no row level security here.
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function session(email) {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email,
    email_confirmed_at: new Date().toISOString(), app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString(),
  };
  const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, email, role: 'authenticated', aud: 'authenticated', exp: now + 3600, iat: now })}.sig`;
  return { access_token: jwt, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'mock-refresh', user };
}

/** Starts the stand-in. `log` records every request as "METHOD /path?query email". */
export function startMockSupabase(port, { delayMs = 400 } = {}) {
  const log = [];
  const tables = {};
  const server = http.createServer((req, res) => {
    const cors = {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || '*',
    };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => setTimeout(() => {
      const url = new URL(req.url, 'http://mock');
      let data = {};
      try { data = body ? JSON.parse(body) : {}; } catch { /* non-JSON body: treat as empty */ }
      log.push(`${req.method} ${url.pathname}${url.search} ${data.email || ''}`.trim());
      const send = (status, obj) => {
        res.writeHead(status, { ...cors, 'Content-Type': 'application/json' });
        res.end(obj === undefined ? '' : JSON.stringify(obj));
      };
      if (url.pathname.startsWith('/rest/v1/')) return rest(tables, url, req, data, send);
      if (data.email === 'down@example.com') { req.socket.destroy(); return; }
      if (url.pathname === '/auth/v1/signup') {
        if (data.email === 'taken@example.com') return send(422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
        if (data.email === 'instant@example.com') return send(200, session(data.email));
        return send(200, {
          id: '00000000-0000-4000-8000-000000000002', aud: 'authenticated', role: '', email: data.email,
          confirmation_sent_at: new Date().toISOString(), app_metadata: { provider: 'email' },
          user_metadata: data.data || {}, identities: [{}], created_at: new Date().toISOString(),
        });
      }
      if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') {
        if (data.password === 'wrong-password') return send(400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
        return send(200, session(data.email));
      }
      if (url.pathname === '/auth/v1/user') return send(200, session('user@example.com').user);
      if (url.pathname === '/auth/v1/logout') return send(204);
      return send(404, { msg: `mock: not handled ${url.pathname}` });
    }, delayMs)); // long enough to observe the busy state
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, log, tables }));
  });
}

const DEFAULTS = { generated_sections: { saved: false }, swipe_file_items: { status: 'Idea' } };

function rest(tables, url, req, data, send) {
  const name = url.pathname.slice('/rest/v1/'.length);
  const rows = (tables[name] ??= []);
  const filters = [...url.searchParams].filter(([k]) => !['select', 'order', 'limit', 'columns'].includes(k));
  const match = (row) => filters.every(([k, v]) => {
    const [op, ...rest] = v.split('.'); const want = rest.join('.');
    if (op === 'eq') return String(row[k]) === want;
    if (op === 'gte') return String(row[k]) >= want;
    throw new Error(`mock: filter ${op} not supported`);
  });
  const single = (req.headers.accept || '').includes('vnd.pgrst.object');
  const reply = (status, list) => {
    if (!single) return send(status, list);
    if (list.length !== 1) return send(406, { code: 'PGRST116', message: `JSON object requested, ${list.length} rows returned`, details: null, hint: null });
    return send(status, list[0]);
  };
  const wantsRows = (req.headers.prefer || '').includes('return=representation');
  if (req.method === 'GET') {
    let out = rows.filter(match);
    const order = url.searchParams.get('order');
    if (order) {
      const [col, dir] = order.split('.');
      out = [...out].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === 'desc' ? -1 : 1));
    }
    return reply(200, out);
  }
  if (req.method === 'POST') {
    const created = (Array.isArray(data) ? data : [data]).map((r) => ({ id: randomUUID(), created_at: new Date().toISOString(), ...DEFAULTS[name], ...r }));
    rows.push(...created);
    return wantsRows ? reply(201, created) : send(201);
  }
  if (req.method === 'PATCH') {
    const hit = rows.filter(match);
    for (const r of hit) Object.assign(r, data);
    return wantsRows ? reply(200, hit) : send(204);
  }
  if (req.method === 'DELETE') {
    tables[name] = rows.filter((r) => !match(r));
    return send(204);
  }
  return send(405, { message: `mock: ${req.method} not supported` });
}
