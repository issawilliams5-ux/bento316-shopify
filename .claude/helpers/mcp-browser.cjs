#!/usr/bin/env node
// Starts a browser MCP server (.mcp.json) with a browser that exists on this
// machine, so one config works on a desktop and in a Claude cloud container.
//
//   node mcp-browser.cjs chrome-devtools | playwright
//
// - Desktop: the server finds the installed Chrome itself and runs headed.
// - Cloud container: no Chrome, but Playwright's Chromium is preinstalled at
//   /opt/pw-browsers/chromium; it runs headless, and as root it needs
//   --no-sandbox. MCP_BROWSER_PATH overrides the browser on any machine.
// - Telemetry: chrome-devtools usage statistics and CrUX lookups are off.
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');

const CLOUD_CHROMIUM = '/opt/pw-browsers/chromium';
const browser = process.env.MCP_BROWSER_PATH || (fs.existsSync(CLOUD_CHROMIUM) ? CLOUD_CHROMIUM : '');
const asRoot = typeof process.getuid === 'function' && process.getuid() === 0;

const servers = {
  'chrome-devtools': [
    'chrome-devtools-mcp@1.10.1', '--no-usage-statistics', '--no-performance-crux',
    ...(browser ? ['--headless', '--isolated', '--executablePath', browser] : []),
    ...(asRoot ? ['--chromeArg=--no-sandbox'] : []),
  ],
  playwright: [
    '@playwright/mcp@0.0.83',
    ...(browser ? ['--headless', '--isolated', '--browser', 'chromium', '--executable-path', browser] : []),
    ...(asRoot ? ['--no-sandbox'] : []),
  ],
};

const name = process.argv[2];
if (!servers[name]) {
  process.stderr.write(`mcp-browser: unknown server "${name}" (expected ${Object.keys(servers).join(' or ')})\n`);
  process.exit(2);
}

const win = process.platform === 'win32';
const child = spawn(win ? 'npx.cmd' : 'npx', ['-y', ...servers[name]], { stdio: 'inherit', shell: win });
child.on('error', (err) => { process.stderr.write(`mcp-browser: could not start npx: ${err.message}\n`); process.exit(1); });
child.on('exit', (code, signal) => process.exit(signal ? 1 : code ?? 1));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
