// Exercise the actual last deployed storage implementation with current data.
// No browser or real user's storage is used.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createStorage, STORAGE_KEY } from '../assets/js/storage.js';
import { createProfileManager } from '../assets/js/profiles.js';
import { fakeLocal, result } from '../tests/helpers.js';

const previous = process.argv[2] ?? '7b40fcbc978e9e02a50bac1ba60331953c3ac964';
const resolved = execFileSync('git', ['rev-parse', '--verify', `${previous}^{commit}`], { encoding: 'utf8' }).trim();
const temporary = await mkdtemp(join(tmpdir(), 'strojopis-rollback-'));
try {
  await writeFile(join(temporary, 'package.json'), '{"type":"module"}');
  for (const file of ['data-model.js', 'storage.js', 'profiles.js']) {
    await writeFile(join(temporary, file), execFileSync('git', ['show', `${resolved}:assets/js/${file}`]));
  }
  const oldStorageModule = await import(pathToFileURL(join(temporary, 'storage.js')).href);
  const oldProfilesModule = await import(pathToFileURL(join(temporary, 'profiles.js')).href);
  const local = fakeLocal({ other_app: 'keep' });
  const options = { getStorage: () => local, readCookies: () => '', deleteCookie: () => assert.fail('Unexpected cookie deletion') };
  const current = createStorage(options);
  assert.equal(current.enable(), true);
  const profiles = createProfileManager(current);
  profiles.createProfile('Rollback fixture', { keyboardLocale: 'es-es', keyboardPlatform: 'windows', keyboardModel: 'dell-xps-2018-ansi' });
  profiles.recordResult(result(1));
  profiles.recordResult(result(2, { difficulty: 4, exerciseVersion: 2, sentenceCount: 4, textId: 'sentence-a', textIds: ['sentence-a', 'sentence-b', 'sentence-c', 'sentence-d'] }));
  profiles.recordResult(result(4, { difficulty: 4, exerciseVersion: 3, sentenceCount: 12, textId: 'sentence-0', textIds: Array.from({length:12}, (_, i) => `sentence-${i}`) }));
  const saved = local.getItem(STORAGE_KEY);
  assert.equal(JSON.parse(saved).schemaVersion, 4);

  const rolledBack = oldStorageModule.createStorage(options);
  assert.deepEqual(rolledBack.status(), { persistent: false, blocked: true, reason: 'future' });
  assert.equal(rolledBack.enable(), false);
  assert.equal(rolledBack.read().profiles.length, 0);
  const temporaryProfiles = oldProfilesModule.createProfileManager(rolledBack);
  temporaryProfiles.createProfile('Temporary old session');
  temporaryProfiles.recordResult(result(3));
  assert.equal(temporaryProfiles.getActiveProfile().history.length, 1);
  assert.equal(local.getItem(STORAGE_KEY), saved);
  assert.equal(local.getItem('other_app'), 'keep');

  const restored = createStorage(options);
  assert.deepEqual(restored.status(), { persistent: true, blocked: false, reason: 'saved' });
  assert.deepEqual(restored.read(), current.read());
  assert.equal(restored.read().profiles[0].history.length, 3);
  assert.equal(local.getItem(STORAGE_KEY), saved);
  console.log(`OK: rollback ${resolved} protects schema 4 byte-for-byte, permits temporary training, and current code restores settings, history and all result formats.`);
  console.log('Limit: the old app cannot display schema 4 progress; temporary old-session results are not persisted. Do not clear protected data.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
