// End-to-end tests for login, signup, the dashboard gate and logout.
// Run: npm run test:e2e   (first time on a new machine: npx playwright install chromium)
//
// The suite builds the app with NEXT_PUBLIC_SUPABASE_URL pointed at a local
// stand-in (./mock-supabase.mjs), serves it with `next start`, and drives it in
// headless Chromium. No real Supabase project or network access is needed.
// The build it leaves in .next points at the stand-in: run `npm run build`
// again before `next start`-ing the app for real.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startMockSupabase } from './mock-supabase.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const NEXT_BIN = createRequire(import.meta.url).resolve('next/dist/bin/next');
const MOCK_PORT = 54329;
const APP_PORT = 3199;
const APP = `http://127.0.0.1:${APP_PORT}`;
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-dummy-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'e2e-dummy-service-role-key', // the rate limiter fails closed without one
  OPENAI_API_KEY: '', // generation falls back to the local template pack
  TYPESAFE_API_KEY: '',
  NEXT_TELEMETRY_DISABLED: '1',
};

let mock, app, browser;

before(async () => {
  mock = await startMockSupabase(MOCK_PORT);
  const build = spawnSync(process.execPath, [NEXT_BIN, 'build'], { cwd: ROOT, env, encoding: 'utf8' });
  if (build.status !== 0) throw new Error(`next build failed:\n${build.stdout}\n${build.stderr}`);
  app = spawn(process.execPath, [NEXT_BIN, 'start', '-p', String(APP_PORT), '-H', '127.0.0.1'], { cwd: ROOT, env, stdio: 'ignore' });
  const deadline = Date.now() + 60_000;
  for (;;) {
    try { if ((await fetch(`${APP}/login`)).ok) break; } catch { /* not listening yet */ }
    if (Date.now() > deadline) throw new Error('next start did not answer within 60s');
    await new Promise((r) => setTimeout(r, 500));
  }
  // Chromium refuses to start sandboxed as root (CI containers); everyone else keeps the sandbox.
  browser = await chromium.launch({ args: process.getuid?.() === 0 ? ['--no-sandbox'] : [] });
});

after(async () => {
  await browser?.close();
  app?.kill();
  await new Promise((r) => (mock ? mock.server.close(r) : r()));
});

async function newPage(width = 390, height = 844) {
  const context = await browser.newContext({ viewport: { width, height } });
  return context.newPage();
}

/** WCAG contrast of an element's text against its composited background. */
function contrastOf(locator) {
  return locator.evaluate((el) => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
    const over = (top, under) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]));
    const layers = [];
    for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) layers.push(c); }
    let bg = [255, 255, 255];
    for (const c of layers.reverse()) bg = over(c, bg);
    const fg = over(rgba(getComputedStyle(el).color), bg);
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const [a, b] = [lum(fg), lum(bg)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

/** Fills the form and submits with Enter, as a keyboard user would. */
async function submit(page, path, fields) {
  await page.goto(APP + path);
  for (const [label, value] of Object.entries(fields)) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel('Password', { exact: true }).press('Enter');
}

const alertIn = (page) => page.locator('form [aria-live=polite] [role=alert]');
const noticeIn = (page) => page.locator('form [aria-live=polite] p:not([role=alert])');

test('signup explains the password rule; login does not', async () => {
  const page = await newPage();
  await page.goto(`${APP}/signup`);
  const password = page.getByLabel('Password', { exact: true });
  const hintId = await password.getAttribute('aria-describedby');
  assert.ok(hintId, 'password field has aria-describedby');
  const hint = page.locator(`[id="${hintId}"]`);
  assert.equal((await hint.textContent()).trim(), 'At least 8 characters.');
  assert.ok(await contrastOf(hint) >= 4.5);
  assert.equal(await password.getAttribute('minlength'), '8');

  await page.goto(`${APP}/login`);
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('aria-describedby'), null);
});

test('signup with a taken email shows the busy state, then an announced error', async () => {
  const page = await newPage();
  await submit(page, '/signup', { Name: 'Test', Email: 'taken@example.com', Password: 'longenough1' });
  const button = page.locator('form button');
  await assert.doesNotReject(button.filter({ hasText: 'Please wait…' }).waitFor({ timeout: 2000 }));
  assert.ok(await button.isDisabled(), 'button is disabled while busy');
  await alertIn(page).waitFor();
  assert.equal((await alertIn(page).textContent()).trim(), 'User already registered');
  assert.ok(await contrastOf(alertIn(page)) >= 4.5);
  assert.equal((await button.textContent()).trim(), 'Create account');
});

test('signup that needs email confirmation shows the notice and stays on the page', async () => {
  const page = await newPage();
  await submit(page, '/signup', { Email: 'confirm@example.com', Password: 'longenough1' });
  await noticeIn(page).waitFor();
  assert.equal((await noticeIn(page).textContent()).trim(), 'Check your email to confirm your account, then log in.');
  assert.ok(await contrastOf(noticeIn(page)) >= 4.5);
  assert.equal(new URL(page.url()).pathname, '/signup');
});

test('signup with confirmation off goes straight to the dashboard', async () => {
  const page = await newPage();
  await submit(page, '/signup', { Email: 'instant@example.com', Password: 'longenough1' });
  await page.waitForURL('**/dashboard');
  await page.getByRole('heading', { level: 1 }).waitFor();
});

test('login with a wrong password shows an announced error', async () => {
  const page = await newPage();
  await submit(page, '/login', { Email: 'user@example.com', Password: 'wrong-password' });
  await alertIn(page).waitFor();
  assert.equal((await alertIn(page).textContent()).trim(), 'Invalid login credentials');
  assert.equal(new URL(page.url()).pathname, '/login');
});

test('login when the auth service is unreachable says so in plain words', async () => {
  const page = await newPage();
  await submit(page, '/login', { Email: 'down@example.com', Password: 'whatever123' });
  await alertIn(page).waitFor({ timeout: 15_000 });
  assert.equal((await alertIn(page).textContent()).trim(), "Can't reach the sign-in service. Check your connection and try again.");
});

test('login reaches the dashboard and logout returns to login', async () => {
  const page = await newPage();
  await submit(page, '/login', { Email: 'user@example.com', Password: 'right-password' });
  await page.waitForURL('**/dashboard');
  await page.getByRole('heading', { level: 1 }).waitFor(); // the gate shows "Checking your session…" until getSession resolves
  assert.equal(await page.getByText('Checking your session…').count(), 0);
  await page.getByRole('button', { name: 'Log out' }).first().click();
  await page.waitForURL('**/login');
});

test('the dashboard sends visitors without a session to login', async () => {
  const page = await newPage();
  await page.goto(`${APP}/dashboard`);
  await page.waitForURL('**/login');
});

test('pressing Enter repeatedly while busy sends one request', async () => {
  const page = await newPage();
  await page.goto(`${APP}/login`);
  await page.getByLabel('Email', { exact: true }).fill('user@example.com');
  const password = page.getByLabel('Password', { exact: true });
  await password.fill('wrong-password');
  const before = mock.log.length;
  for (let i = 0; i < 3; i++) { await password.press('Enter'); await page.waitForTimeout(80); }
  await alertIn(page).waitFor();
  const sent = mock.log.slice(before).filter((l) => l.startsWith('POST /auth/v1/token'));
  assert.equal(sent.length, 1);
});

test('both forms reflow at 320px without horizontal scrolling', async () => {
  const page = await newPage(320, 640);
  for (const path of ['/login', '/signup']) {
    await page.goto(APP + path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `${path} overflows by ${overflow}px`);
  }
});

async function logIn(page) {
  await submit(page, '/login', { Email: 'user@example.com', Password: 'right-password' });
  await page.waitForURL('**/dashboard');
}

test('the generate and regenerate APIs refuse callers without a session', async () => {
  for (const path of ['/api/generate', '/api/regenerate']) {
    const res = await fetch(APP + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(res.status, 401, path);
  }
});

test('generating a pack saves it; Save and Regenerate persist', async () => {
  const page = await newPage(1280, 900);
  await logIn(page);
  await page.goto(`${APP}/dashboard/new`);
  const brief = { 'Product name': 'Test Lamp', Category: 'Home', Price: '$40', 'Target customer': 'renters',
    'Main problem solved': 'dim rooms', 'Main benefit': 'warm light anywhere', 'Key features': 'cordless, dimmable' };
  for (const [label, value] of Object.entries(brief)) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Generate Ad Pack' }).click();
  await page.waitForURL(/\/dashboard\/packs\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  await page.getByRole('heading', { level: 1, name: 'Test Lamp ad pack' }).waitFor();
  assert.equal(mock.tables.generated_sections.length, 10);
  assert.equal(mock.tables.usage_events.filter((e) => e.event_type === 'ad_pack_generation').length, 1);

  const hooks = page.locator('section', { has: page.getByRole('heading', { name: '50 Hooks' }) });
  const save = hooks.getByRole('button', { name: 'Save' });
  await save.click();
  await hooks.getByRole('button', { name: 'Saved' }).waitFor();
  assert.equal(await hooks.getByRole('button', { name: 'Saved' }).getAttribute('aria-pressed'), 'true');
  assert.equal(mock.tables.generated_sections.find((r) => r.section_key === 'hooks').saved, true);

  const faqs = page.locator('section', { has: page.getByRole('heading', { name: 'FAQs' }) });
  await faqs.getByRole('button', { name: 'Regenerate' }).click();
  await faqs.getByRole('button', { name: 'Regenerate' }).waitFor({ timeout: 30_000 });
  assert.equal(await faqs.getByRole('alert').count(), 0);
  assert.equal(mock.tables.usage_events.filter((e) => e.event_type === 'ad_pack_generation').length, 2);
});

test('the swipe file saves an item and lists it', async () => {
  const page = await newPage(1280, 900);
  await logIn(page);
  await page.goto(`${APP}/dashboard/swipe-file`);
  await page.getByText('Nothing saved yet.').waitFor();
  await page.getByLabel('Ad link', { exact: true }).fill('https://example.com/ad/42');
  await page.getByLabel('Product', { exact: true }).fill('Desk Fan');
  await page.getByLabel('Hook', { exact: true }).fill('It is quieter than my laptop.');
  await page.getByRole('button', { name: 'Save inspiration' }).click();
  await page.getByRole('heading', { level: 2, name: 'Desk Fan' }).waitFor();
  assert.equal(mock.tables.swipe_file_items.at(-1).ad_link, 'https://example.com/ad/42');
  assert.equal(await page.getByLabel('Product', { exact: true }).inputValue(), '', 'form resets after saving');
});

test('deploy status needs a session and an admin email', async () => {
  assert.equal((await fetch(`${APP}/api/deploys`)).status, 401);
  const page = await newPage();
  await logIn(page);
  await page.goto(`${APP}/dashboard/deploys`);
  const alert = page.locator('[aria-live=polite] [role=alert]');
  await alert.waitFor();
  assert.equal((await alert.textContent()).trim(), 'Deploy status is limited to admins');
});
