/**
 * `npm run demo` — the command to use in front of a restaurant owner.
 *
 * Opens a temporary public HTTPS address that points at the server running on
 * this laptop, then starts the app with that address baked in. The printed QR
 * codes encode the public address, so any phone can scan them over mobile data
 * without joining the restaurant's wifi at all.
 *
 * The address is temporary and changes each run — that is fine for a demo, and
 * it means nothing is left exposed after you close the terminal.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PORT = process.env.PORT || 3000;

function resolveCloudflared() {
  try {
    const { bin } = require('cloudflared');
    if (bin && fs.existsSync(bin)) return bin;
  } catch {
    /* package missing or binary never downloaded */
  }
  return null;
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
  fail('No production build found. Run `npm run build` first, then `npm run demo`.');
}

const cloudflared = resolveCloudflared();
if (!cloudflared) {
  fail(
    [
      'The tunnel helper is not installed, so there is no public address to put in the QR codes.',
      '',
      '  Try:  npm install cloudflared',
      '',
      '  If that fails (no internet, or a blocked network), fall back to the local',
      '  wifi method instead:',
      '',
      '    npm start',
      '    npm run where      # prints e.g. http://192.168.1.20:3000',
      '',
      '  Then open /admin/qr at that address. It only works if the phone is on the',
      '  same wifi as this laptop.',
    ].join('\n')
  );
}

console.log('\n  Opening a public address for the demo…');

const tunnel = spawn(
  cloudflared,
  ['tunnel', '--url', `http://localhost:${PORT}`, '--no-autoupdate'],
  { stdio: ['ignore', 'pipe', 'pipe'] }
);

let server = null;
let publicUrl = null;
let settled = false;

const giveUp = setTimeout(() => {
  if (settled) return;
  settled = true;
  console.error(
    [
      '',
      '  Could not open a public address within 40 seconds.',
      '',
      '  This is almost always a blocked or offline network. Fall back to local wifi:',
      '',
      '    npm start',
      '    npm run where',
      '',
    ].join('\n')
  );
  shutdown(1);
}, 40_000);

function startServer(url) {
  console.log(`\n  ${'='.repeat(58)}`);
  console.log('  Ready to demo. Scan from any phone — no wifi needed.\n');
  console.log(`    Guest menu   ${url}/m/mapo-grill/1`);
  console.log(`    QR codes     ${url}/admin/qr        <- print or show this`);
  console.log(`    Staff board  ${url}/staff           <- keep this open`);
  console.log(`    Owner admin  ${url}/admin`);
  console.log('\n    Staff PIN    1234');
  console.log(`  ${'='.repeat(58)}\n`);

  server = spawn('npm', ['start'], {
    stdio: 'inherit',
    env: { ...process.env, BASE_URL: url, PORT: String(PORT) },
  });

  server.on('exit', (code) => shutdown(code ?? 0));
}

// cloudflared announces the assigned address on stderr.
function scan(chunk) {
  const text = chunk.toString();
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (match && !publicUrl) {
    publicUrl = match[0];
    settled = true;
    clearTimeout(giveUp);
    startServer(publicUrl);
  }
}

tunnel.stdout.on('data', scan);
tunnel.stderr.on('data', scan);

tunnel.on('exit', (code) => {
  if (!publicUrl) {
    clearTimeout(giveUp);
    if (!settled) {
      settled = true;
      console.error(`\n  The tunnel exited before giving an address (code ${code}).`);
      console.error('  Check your internet connection, or use `npm start` + `npm run where`.\n');
    }
    process.exit(1);
  }
});

function shutdown(code = 0) {
  clearTimeout(giveUp);
  server?.kill();
  tunnel.kill();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
