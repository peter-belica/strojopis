import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// These licenses permit commercial use without a paid license. Distribution
// obligations still apply; runtime notices are shipped with the static site.
const accepted = new Set(['MIT', 'Apache-2.0', 'ISC', 'BSD-3-Clause', 'BSD-2-Clause', '0BSD', 'MPL-2.0']);
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
let count = 0;
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (!name) continue;
  if (!accepted.has(pkg.license)) throw new Error(`Over licenciu ${name}@${pkg.version}: ${pkg.license || 'neuvedená'}`);
  count++;
}
const directory = 'assets/vendor/fullik/';
const vendor = JSON.parse(await readFile(`${directory}provenance.json`, 'utf8'));
if (!accepted.has(vendor.license)) throw new Error(`Over licenciu ${vendor.name}: ${vendor.license}`);
for (const [file, expected] of Object.entries(vendor.files)) {
  const digest = createHash('sha256').update(await readFile(directory + file)).digest('hex');
  if (digest !== expected) throw new Error(`Zmenený prevzatý súbor: ${directory}${file}`);
}
const license = await readFile(directory + 'LICENSE', 'utf8');
const notices = await readFile('THIRD_PARTY_NOTICES.txt', 'utf8');
if (!notices.includes(license.trim())) throw new Error('V distribučných oznámeniach chýba licencia Fullik.');
console.log(`OK: ${count} balíkov z lockfile a Fullik ${vendor.version}; bezplatné licencie pre komerčné použitie, zdroj a oznámenia overené.`);
