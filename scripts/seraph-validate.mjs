#!/usr/bin/env node
/**
 * Seraph OS deterministic validator.
 *
 * Everything here is a check that code can answer more reliably than a model:
 * frontmatter shape, JSON parseability, file presence, secret patterns, and
 * router routing regressions. No network, no dependencies, no model calls.
 *
 *   node scripts/seraph-validate.mjs                # everything
 *   node scripts/seraph-validate.mjs --secrets      # one section
 *   node scripts/seraph-validate.mjs --json-out     # machine-readable
 *
 * Exit 0 = PASS, 1 = FAIL, 2 = usage error.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const root = process.cwd();
const args = process.argv.slice(2);
const jsonOut = args.includes('--json-out');
const sections = args.filter((a) => a.startsWith('--') && a !== '--json-out').map((a) => a.slice(2));
const want = (name) => sections.length === 0 || sections.includes(name);

const results = [];
const record = (section, name, status, detail = '') => results.push({ section, name, status, detail });
const pass = (s, n, d) => record(s, n, 'PASS', d);
const fail = (s, n, d) => record(s, n, 'FAIL', d);
const skip = (s, n, d) => record(s, n, 'SKIP', d);

const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/** Minimal YAML frontmatter reader — flat `key: value` only, which is all an
 *  agent or skill header uses. Avoids a YAML dependency on purpose. */
function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// ---------------------------------------------------------------- agents ---
const REQUIRED_AGENTS = ['orchestrator', 'engineering', 'commerce', 'media-growth', 'research-intelligence'];

if (want('agents')) {
  const dir = '.claude/agents';
  const osRoot = exists('registry/capabilities.json') && exists('AGENTS.md');
  if (!exists(dir)) {
    osRoot ? fail('agents', 'directory', `${dir} missing at OS root`)
           : skip('agents', 'directory', 'no local agents — delegates to the OS root');
  } else {
    const files = fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.md'));
    const isOsRoot = exists('registry/capabilities.json') && exists('AGENTS.md');
    if (isOsRoot) {
      for (const name of REQUIRED_AGENTS) {
        if (!files.includes(`${name}.md`)) fail('agents', name, 'required agent file missing at OS root');
      }
    } else {
      skip('agents', 'seraph-five', 'domain workspace — the five agents live once at the OS root');
    }
    for (const f of files) {
      const fm = frontmatter(read(path.join(dir, f)));
      const id = path.basename(f, '.md');
      if (!fm) { fail('agents', id, 'no YAML frontmatter'); continue; }
      if (fm.name !== id) { fail('agents', id, `frontmatter name "${fm.name}" != filename "${id}"`); continue; }
      if (!fm.description || fm.description.length < 30) { fail('agents', id, 'description missing or too short to route on'); continue; }
      if (!fm.tools) { fail('agents', id, 'no tools declared (least privilege requires an explicit list)'); continue; }
      pass('agents', id, `${fm.tools.split(',').length} tools`);
    }
  }
}

// ---------------------------------------------------------------- skills ---
if (want('skills')) {
  const dir = '.claude/skills';
  if (!exists(dir)) {
    skip('skills', 'directory', `${dir} missing`);
  } else {
    for (const d of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const rel = path.join(dir, d.name, 'SKILL.md');
      if (!exists(rel)) { fail('skills', d.name, 'directory has no SKILL.md'); continue; }
      const fm = frontmatter(read(rel));
      if (!fm) { fail('skills', d.name, 'no YAML frontmatter'); continue; }
      if (fm.name !== d.name) { fail('skills', d.name, `frontmatter name "${fm.name}" != directory "${d.name}"`); continue; }
      if (!fm.description) { fail('skills', d.name, 'no description — cannot be triggered'); continue; }
      const localAgents = exists('.claude/agents')
        ? fs.readdirSync(path.join(root, '.claude/agents')).filter((f) => f.endsWith('.md')).map((f) => path.basename(f, '.md'))
        : [];
      if (fm.agent && !REQUIRED_AGENTS.includes(fm.agent) && !localAgents.includes(fm.agent)) {
        fail('skills', d.name, `delegates to unknown agent "${fm.agent}"`); continue;
      }
      const body = read(rel).replace(/^---[\s\S]*?---/, '').trim();
      if (body.length < 40) { fail('skills', d.name, 'body is effectively empty'); continue; }
      pass('skills', d.name, fm.agent ? `-> ${fm.agent}` : 'inline');
    }
  }
}

// ------------------------------------------------------------------ json ---
if (want('json')) {
  const targets = ['.mcp.json', '.claude/settings.json', 'registry/capabilities.json',
                   'registry/execution-receipt.schema.json', 'registry/public-apis-catalog.json'];
  for (const t of targets) {
    if (!exists(t)) { skip('json', t, 'not present'); continue; }
    try { JSON.parse(read(t)); pass('json', t, 'parses'); }
    catch (e) { fail('json', t, e.message); }
  }
  if (exists('registry/capabilities.json')) {
    const reg = JSON.parse(read('registry/capabilities.json'));
    const mapped = Object.values(reg.agents?.by_task_type ?? {});
    const unknown = [...new Set(mapped)].filter((a) => !REQUIRED_AGENTS.includes(a));
    unknown.length ? fail('json', 'agent-map', `unknown agents: ${unknown.join(', ')}`)
                   : pass('json', 'agent-map', `${Object.keys(reg.agents?.by_task_type ?? {}).length} task types mapped`);
    const routed = Object.keys(reg.routing ?? {});
    const missing = routed.filter((k) => !(k in (reg.agents?.by_task_type ?? {})));
    missing.length ? fail('json', 'routing-coverage', `task types with no owning agent: ${missing.join(', ')}`)
                   : pass('json', 'routing-coverage', `${routed.length} task types have an owner`);
  }
}

// ---------------------------------------------------------------- memory ---
if (want('memory')) {
  if (!exists('memory')) {
    skip('memory', 'store', 'no memory/ here — this is a domain workspace, the OS root owns memory');
  } else {
    for (const f of ['memory/STATE.md', 'memory/DECISIONS.md', 'memory/CHECKPOINT.md', 'memory/MEMORY_POLICY.md']) {
      exists(f) ? pass('memory', f, `${read(f).split('\n').length} lines`) : fail('memory', f, 'missing');
    }
  }
}

// --------------------------------------------------------------- secrets ---
// Patterns are split so this file never contains a literal that matches itself.
const SECRET_PATTERNS = [
  ['openai-style key',   new RegExp('\\bsk-[A-Za-z0-9_-]{20,}')],
  ['github token',       new RegExp('\\bgh[pousr]_[A-Za-z0-9]{30,}')],
  ['github fine-grained',new RegExp('\\bgithub' + '_pat_[A-Za-z0-9_]{30,}')],
  ['aws access key',     new RegExp('\\bAKIA[0-9A-Z]{16}\\b')],
  ['slack token',        new RegExp('\\bxox[baprs]-[A-Za-z0-9-]{10,}')],
  ['google api key',     new RegExp('\\bAIza[0-9A-Za-z_-]{35}\\b')],
  ['private key block',  new RegExp('-----BEGIN [A-Z ]*PRIVATE KEY-----')],
  ['assigned secret',    new RegExp('(?:api[_-]?key|secret|password|token|passwd)\\s*[:=]\\s*["\'][^"\'\\s${}]{16,}["\']', 'i')],
];
const PLACEHOLDER = new RegExp(
  'your[-_]|example|placeholder|changeme|change[-_]me|dummy|\\bfake\\b|sample|' +
  'redacted|xxxx|<[^>]+>|\\.\\.\\.|\\$\\{|\\btest[-_]|[-_]test\\b|super[-_]secret|' +
  'not[-_]a[-_]real|insert[-_]|goes[-_]here|abc123|foo|bar\\b', 'i');

const SECRET_SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', '.next', 'graphify-out', '.venv']);

function walk(dir, out = []) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SECRET_SKIP_DIRS.has(d.name)) continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) walk(full, out);
    else if (d.isFile()) out.push(full);
  }
  return out;
}

if (want('secrets')) {
  const files = walk(root).filter((f) => {
    if (fs.statSync(f).size > 512 * 1024) return false;
    const base = path.basename(f);
    if (base === path.basename(process.argv[1])) return false;   // this validator
    if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|mp4|mp3|wav|zip|gz|pdf|lock)$/i.test(base)) return false;
    return true;
  });
  const hits = [];
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (text.includes('\u0000')) continue;
    const isExample = /\.env\.example$|\.sample$|\.template$/.test(f);
    text.split('\n').forEach((line, i) => {
      // An .env.example with names and empty values is the correct pattern.
      if (isExample && /^[A-Z0-9_]+=\s*$/.test(line.trim())) return;
      for (const [label, re] of SECRET_PATTERNS) {
        const m = re.exec(line);
        if (!m) continue;
        if (PLACEHOLDER.test(m[0])) continue;   // announces itself as fake
        hits.push(`${path.relative(root, f)}:${i + 1} [${label}]`);
      }
    });
  }
  hits.length ? fail('secrets', 'tree scan', `${hits.length} hit(s): ${hits.slice(0, 8).join('; ')}`)
              : pass('secrets', 'tree scan', `${files.length} files clean`);

  const gi = exists('.gitignore') ? read('.gitignore') : '';
  /(^|\n)\.env($|\n|\*)/.test(gi) ? pass('secrets', '.gitignore', '.env excluded')
                                  : fail('secrets', '.gitignore', '.env is not git-ignored');
}

// ---------------------------------------------------------------- router ---
// Routing regressions. Each case is a request and the agent that must own it.
const ROUTER_CASES = [
  ['Build a small MCP integration',            'engineering'],
  ['Improve my Shopify product page',          'commerce'],
  ['Build my next faceless YouTube video',     'media-growth'],
  ['Find the best model for this workload',    'research-intelligence'],
  ['Backtest this strategy',                   'research-intelligence'],
  ['fix the broken checkout error',            'commerce'],
  ['run a playwright browser screenshot test', 'engineering'],
  ['brainstorm a product idea',                'orchestrator'],
  ['audit the agent os control plane architecture', 'orchestrator'],
  ['wallet payment money movement',            'orchestrator'],
];
const BOUNDARY_CASES = [
  ['deploy to production and publish it', 'explicit_user_approval_required'],
  ['enable live trading with real money', 'explicit_user_approval_required'],
  ['change the price and update inventory', 'explicit_user_approval_required'],
  ['read the product description',        'none'],
];

if (want('router')) {
  if (!exists('scripts/route-task.mjs')) {
    skip('router', 'route-task.mjs', 'not present');
  } else {
    const run = (req) => JSON.parse(execFileSync(process.execPath, ['scripts/route-task.mjs', req], { cwd: root, encoding: 'utf8' }));
    for (const [req, expected] of ROUTER_CASES) {
      try {
        const got = run(req).primary_agent;
        got === expected ? pass('router', req.slice(0, 44), `-> ${got}`)
                         : fail('router', req.slice(0, 44), `expected ${expected}, got ${got}`);
      } catch (e) { fail('router', req.slice(0, 44), e.message.split('\n')[0]); }
    }
    for (const [req, expected] of BOUNDARY_CASES) {
      try {
        const got = run(req).permission_gate;
        got === expected ? pass('router', `gate: ${req.slice(0, 36)}`, got)
                         : fail('router', `gate: ${req.slice(0, 36)}`, `expected ${expected}, got ${got}`);
      } catch (e) { fail('router', `gate: ${req.slice(0, 36)}`, e.message.split('\n')[0]); }
    }
  }
}

// ------------------------------------------------------------------ guard ---
// The security guard is a control, so it carries its own two-directional
// regression suite. Run it as part of validation, not only by hand.
if (want('guard')) {
  if (!exists('scripts/test-guard-hook.mjs') || !exists('.claude/hooks/seraph/pre-tool-use.mjs')) {
    skip('guard', 'hook suite', 'guard or its test suite not present here');
  } else {
    const r = require('node:child_process').spawnSync(process.execPath, ['scripts/test-guard-hook.mjs'], { cwd: root, encoding: 'utf8' });
    const summary = (r.stdout || '').split('\n').find((l) => l.includes('cases behave')) || '';
    r.status === 0 ? pass('guard', 'hook suite', summary.trim())
                   : fail('guard', 'hook suite', (r.stdout || '').split('\n').filter((l) => l.includes('FAIL')).slice(0, 5).join('; '));
  }
}

// ---------------------------------------------------------------- videos ---
const VIDEO_STAGE_ORDER = ['topic.json', 'research.json', 'script.md', 'voice.json',
                          'visuals.json', 'thumbnail.json', 'upload.json'];

function stageRequirements() {
  const req = {};
  for (const stage of VIDEO_STAGE_ORDER) {
    if (stage.endsWith('.md')) { req[stage] = null; continue; }
    const rel = path.join('videos', '_schema', stage.replace('.json', '.schema.json'));
    if (!exists(rel)) { req[stage] = []; continue; }
    try { req[stage] = JSON.parse(read(rel)).required ?? []; }
    catch { req[stage] = []; }
  }
  return req;
}

if (want('videos')) {
  if (!exists('videos')) {
    skip('videos', 'pipeline', 'no videos/ directory in this workspace');
  } else {
    // Schemas must parse before anything is validated against them.
    const schemaDir = path.join(root, 'videos', '_schema');
    if (fs.existsSync(schemaDir)) {
      let bad = [];
      for (const f of fs.readdirSync(schemaDir).filter((f) => f.endsWith('.json'))) {
        try { JSON.parse(read(path.join('videos', '_schema', f))); } catch (e) { bad.push(`${f}: ${e.message}`); }
      }
      bad.length ? fail('videos', '_schema', bad.join('; '))
                 : pass('videos', '_schema', `${fs.readdirSync(schemaDir).length} schemas parse`);
    }
    const VIDEO_STAGES = stageRequirements();
    const slugs = fs.readdirSync(path.join(root, 'videos'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);
    if (!slugs.length) skip('videos', 'pipeline', 'no video directories yet');
    for (const slug of slugs) {
      const present = [];
      let broke = false;
      for (const [file, keys] of Object.entries(VIDEO_STAGES)) {
        const rel = path.join('videos', slug, file);
        if (!exists(rel)) break;                     // stages are sequential
        present.push(file);
        if (!keys) continue;
        try {
          const data = JSON.parse(read(rel));
          const missing = keys.filter((k) => !(k in data));
          if (missing.length) { fail('videos', `${slug}/${file}`, `missing required keys: ${missing.join(', ')}`); broke = true; }
        } catch (e) { fail('videos', `${slug}/${file}`, `invalid JSON: ${e.message}`); broke = true; }
      }
      if (!broke) pass('videos', slug, `${present.length}/${VIDEO_STAGE_ORDER.length} stages complete`);
    }
  }
}

// ---------------------------------------------------------------- report ---
const counts = results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
const failed = results.filter((r) => r.status === 'FAIL');

if (jsonOut) {
  console.log(JSON.stringify({ workspace: path.basename(root), counts, results }, null, 2));
} else {
  let current = '';
  for (const r of results) {
    if (r.section !== current) { current = r.section; console.log(`\n[${current.toUpperCase()}]`); }
    const mark = r.status === 'PASS' ? ' ok ' : r.status === 'FAIL' ? 'FAIL' : 'skip';
    console.log(`  ${mark}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
  }
  console.log(`\n${path.basename(root)}: ${counts.PASS || 0} pass, ${counts.FAIL || 0} fail, ${counts.SKIP || 0} skip`);
  console.log(failed.length ? 'RESULT: FAIL' : 'RESULT: PASS');
}
process.exit(failed.length ? 1 : 0);
