#!/usr/bin/env node
/**
 * Regression suite for .claude/hooks/seraph/pre-tool-use.mjs.
 *
 * The guard is a security control, so it needs coverage in both directions:
 * every case it must block, and every case it must NOT block. A guard that
 * blocks ordinary work gets switched off, and a switched-off guard blocks
 * nothing.
 *
 *   node scripts/test-guard-hook.mjs      exit 0 = all cases behave
 */
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const HOOK = path.join(process.cwd(), '.claude/hooks/seraph/pre-tool-use.mjs');
const BLOCK = 2, ALLOW = 0;

const bash = (command) => ({ tool_name: 'Bash', tool_input: { command } });
const write = (file_path, content) => ({ tool_name: 'Write', tool_input: { file_path, content } });

// Values shaped like real credentials, assembled at runtime so this file never
// contains a literal that a secret scanner would flag.
const REAL = {
  openai: 'sk-proj-' + '9Fk2LmQ8xZ4vB1nR7tY0wA3cD6eG5hJ2kP',
  github: 'gh' + 'p_9dK2mQ8xZ4vB1nR7tY0wA3cD6eG5hJ2kP1qS',
  aws:    'AKIA' + '3JQ7XZ2MPLKW9TRV',
  pem:    '-----BEGIN ' + 'RSA PRIVATE KEY-----',
};

const CASES = [
  // --- destructive: must block -------------------------------------------
  ['force push (--force)',        bash('git push --force origin main'), BLOCK],
  ['force push (-f)',             bash('git push -f origin main'), BLOCK],
  ['force push (+refspec)',       bash('git push origin +main'), BLOCK],
  ['force push (+src:dst)',       bash('git push origin +refs/heads/x:main'), BLOCK],
  ['force push after &&',         bash('echo ok && git push --force origin m'), BLOCK],
  ['history rewrite',             bash('git filter-branch --all'), BLOCK],
  ['hard reset to remote',        bash('git reset --hard origin/main'), BLOCK],
  ['remote branch deletion',      bash('git push origin --delete main'), BLOCK],
  ['recursive root delete',       bash('rm -rf /'), BLOCK],
  ['recursive root delete (-fr)', bash('rm -fr /'), BLOCK],

  // --- credential reads: must block --------------------------------------
  ['read .env',                   bash('cat .env'), BLOCK],
  ['read .env.production',        bash('cat .env.production'), BLOCK],
  ['read .env.local',             bash('head -5 .env.local'), BLOCK],

  // --- ordinary work: must NOT block -------------------------------------
  ['normal push',                 bash('git push -u origin my-branch'), ALLOW],
  ['force-with-lease',            bash('git push --force-with-lease origin x'), ALLOW],
  ['scoped delete',               bash('rm -rf ./node_modules'), ALLOW],
  ['read .env.example',           bash('cat .env.example'), ALLOW],
  ['read .env.sample',            bash('cat .env.sample'), ALLOW],
  ['read a normal file',          bash('cat package.json'), ALLOW],
  ['grep gitignore',              bash('grep -c env .gitignore'), ALLOW],
  ['build',                       bash('npm run build'), ALLOW],
  ['test',                        bash('npm test'), ALLOW],

  // --- writes ------------------------------------------------------------
  ['write live openai key',       write('a.js', `const k = "${REAL.openai}";`), BLOCK],
  ['write live github token',     write('a.js', `const k = "${REAL.github}";`), BLOCK],
  ['write live aws key',          write('a.js', `const k = "${REAL.aws}";`), BLOCK],
  ['write private key block',     write('a.pem', REAL.pem), BLOCK],
  ['write doc placeholder',       write('d.md', 'accessToken: "xoxb-your-token"'), ALLOW],
  ['write test fixture',          write('t.ts', 'process.env.SECRET = "a-long-test-secret-value";'), ALLOW],
  ['write env var reference',     write('a.js', 'const k = process.env.OPENAI_API_KEY;'), ALLOW],
  ['write .env.example',          write('.env.example', 'OPENAI_API_KEY='), ALLOW],
  ['write ordinary code',         write('a.js', 'export const x = 1;'), ALLOW],

  // --- robustness --------------------------------------------------------
  ['malformed input fails open',  'not json at all', ALLOW],
];

let failed = 0;
for (const [name, payload, expected] of CASES) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const r = spawnSync(process.execPath, [HOOK], { input, encoding: 'utf8' });
  const got = r.status;
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`  ${ok ? ' ok ' : 'FAIL'}  ${name.padEnd(30)} expected ${expected === BLOCK ? 'BLOCK' : 'allow'}, got ${got === BLOCK ? 'BLOCK' : got === ALLOW ? 'allow' : got}`);
}

console.log(`\nguard hook: ${CASES.length - failed}/${CASES.length} cases behave correctly`);
console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(failed ? 1 : 0);
