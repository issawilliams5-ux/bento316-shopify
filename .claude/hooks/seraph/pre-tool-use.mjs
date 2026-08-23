#!/usr/bin/env node
/**
 * Seraph deterministic guard (PreToolUse).
 *
 * Layer 3 of the security architecture: enforcement that does not depend on the
 * model having read an instruction. Fast, no dependencies, no network, no model.
 *
 *   exit 0  allow
 *   exit 2  block; stderr is fed back to the model
 *
 * Fails open on its own errors — a broken guard must never wedge the session.
 */
import process from 'node:process';

const SECRETS = [
  ['OpenAI-style key',  new RegExp('\\bsk-[A-Za-z0-9_-]{20,}')],
  ['GitHub token',      new RegExp('\\bgh[pousr]_[A-Za-z0-9]{30,}')],
  ['GitHub PAT',        new RegExp('\\bgithub' + '_pat_[A-Za-z0-9_]{30,}')],
  ['AWS access key',    new RegExp('\\bAKIA[0-9A-Z]{16}\\b')],
  ['Slack token',       new RegExp('\\bxox[baprs]-[A-Za-z0-9-]{10,}')],
  ['Google API key',    new RegExp('\\bAIza[0-9A-Za-z_-]{35}\\b')],
  ['private key block', new RegExp('-----BEGIN [A-Z ]*PRIVATE KEY-----')],
];

// A value that announces itself as fake is documentation or a fixture, not a
// leak. Blocking those would make the guard unusable and get it switched off.
const PLACEHOLDER = new RegExp(
  'your[-_]|example|placeholder|changeme|change[-_]me|dummy|\\bfake\\b|sample|' +
  'redacted|xxxx|<[^>]+>|\\.\\.\\.|\\$\\{|\\btest[-_]|[-_]test\\b|super[-_]secret|' +
  'not[-_]a[-_]real|insert[-_]|goes[-_]here|abc123', 'i');

// Irreversible or history-destroying. These are blocked outright: there is no
// version of these that a human approval inside this session should unlock.
const DESTRUCTIVE = [
  ['recursive root delete',   /\brm\s+(-[A-Za-z]*\s+)*-[A-Za-z]*[rR][A-Za-z]*f?[A-Za-z]*\s+\/(\s|$)/],
  ['force push',              /git\s+push\b[^|;&]*(--force(?!-with-lease)|(\s|^)-f(\s|$)|\s\+[A-Za-z0-9_\/.-]+(:|\s|$))/],
  ['hard reset to remote',    /git\s+reset\s+--hard\s+origin/],
  ['branch deletion (remote)',/git\s+push\b[^|;&]*(--delete|\s:[A-Za-z])/],
  ['history rewrite',         /git\s+filter-branch|filter-repo|\bbfg\b/],
  ['credential exfiltration', /(cat|cp|curl|scp|tar)\b[^|;&]*\.(env|credentials|pem|p12)\b[^|;&]*(\||>|curl|nc\b|scp)/],
  ['credential file read',    /\b(cat|less|more|head|tail|xxd|od|strings|base64)\b[^|;&]*(^|[\s\/])\.env(\.(?!example\b|sample\b|template\b)[A-Za-z]+)?(\s|$)/],
];

// Consequential but legitimate with explicit approval. Not blocked here —
// settings.json asks, and this note tells the model why it is being asked.
const APPROVAL = [
  ['push or land',        /git\s+push|gh\s+pr\s+(create|merge)|git\s+merge\b/],
  ['production deploy',   /\bdeploy\b|vercel\s+(deploy|--prod)|shopify\s+theme\s+push|wrangler\s+publish/],
  ['publish',             /\bpublish\b|shopify\s+theme\s+publish/],
  ['spend or purchase',   /\bstripe\b[^|;&]*\b(charge|refund|payout)\b/],
];

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let ev;
  try { ev = JSON.parse(raw); } catch { process.exit(0); }        // fail open
  try { check(ev); } catch { process.exit(0); }                    // fail open
});

function check(ev) {
  const tool = ev.tool_name || '';
  const input = ev.tool_input || {};

  // --- writes must not carry credentials into the repo --------------------
  if (['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(tool)) {
    const body = [input.content, input.new_string, input.new_source,
                  ...(Array.isArray(input.edits) ? input.edits.map((e) => e.new_string) : [])]
      .filter((v) => typeof v === 'string').join('\n');
    const isExample = /\.(example|sample|template)$/.test(input.file_path || '');
    for (const [label, re] of SECRETS) {
      const m = re.exec(body);
      if (m && !isExample && !PLACEHOLDER.test(m[0])) {
        console.error(
          `BLOCKED by Seraph guard: this write contains what looks like a live ${label}.\n` +
          `Secrets belong in environment variables or a credential store — never in the repo.\n` +
          `Put the NAME in .env.example with an empty value and read it at runtime.`);
        process.exit(2);
      }
    }
    process.exit(0);
  }

  if (tool !== 'Bash') process.exit(0);
  const cmd = String(input.command || '');

  for (const [label, re] of DESTRUCTIVE) {
    if (re.test(cmd)) {
      console.error(
        `BLOCKED by Seraph guard: ${label}.\n` +
        `This is irreversible or destroys history. If it is genuinely required, ` +
        `state what you intend to do and why, and let the human run it themselves.`);
      process.exit(2);
    }
  }

  const hits = APPROVAL.filter(([, re]) => re.test(cmd)).map(([l]) => l);
  if (hits.length) {
    console.error(
      `Seraph approval boundary: ${hits.join(', ')}. ` +
      `policies/SECURITY_GATES.md requires explicit human approval immediately ` +
      `before this. Confirm you have it for this specific action.`);
  }
  process.exit(0);
}
