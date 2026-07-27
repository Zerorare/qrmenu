/**
 * Prints the addresses a phone on the same wifi can reach.
 * Handy right before a demo: `npm run where`
 */
import os from 'node:os';

const port = process.env.PORT || 3000;
const addresses = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address);

console.log('\n  On this computer:');
console.log(`    http://localhost:${port}`);

if (addresses.length === 0) {
  console.log('\n  No network address found — connect to wifi to demo on a phone.\n');
} else {
  console.log('\n  On a phone connected to the same wifi:');
  for (const address of addresses) {
    console.log(`    http://${address}:${port}`);
  }
  console.log('\n  Open /admin/qr from the phone-reachable address so the printed');
  console.log('  QR codes encode that address instead of localhost.\n');
}
