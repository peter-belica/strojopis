import { describe, test, expect } from 'vitest';
import { parseData, emptyData } from '../assets/js/data-model.js';
import { STORAGE_KEY } from '../assets/js/storage.js';
import { setup, result, fakeLocal } from './helpers.js';

const legacyProfile = { id: 'anna', name: 'Anna', keyboardModel: 'dell-xps-2018', languageLayout: 'cs-cz', createdAt: '2026-01-01T00:00:00.000Z' };
const cookieString = values => Object.entries(values).map(([key,value]) => `${key}=${encodeURIComponent(JSON.stringify(value))}`).join('; ');
const cookies = cookieString({ strojopis_profiles_index: ['anna'], strojopis_active_profile_id: 'anna', strojopis_profile_anna: legacyProfile, strojopis_finger_guide: false });

describe('local persistence', () => {
  test('does not write before the user enables remembering', () => {
    const { local, storage, profiles } = setup();
    profiles.createProfile('Anna');
    expect(local.length).toBe(0);
    expect(storage.status().persistent).toBe(false);
    expect(profiles.getActiveProfile().name).toBe('Anna');
  });
  test('restores settings only after explicit enabling', () => {
    const { local, storage, profiles } = setup();
    profiles.createProfile('Anna', { difficulty: 3, guideEnabled: false });
    expect(storage.enable()).toBe(true);
    const restored = setup({ [STORAGE_KEY]: local.getItem(STORAGE_KEY) });
    expect(restored.profiles.getActiveProfile()).toMatchObject({ name: 'Anna', difficulty: 3, guideEnabled: false });
  });
  test.each(['{', 'null', '[]', '{}', '{"schemaVersion":0,"profiles":[]}'])('protects corrupted data: %s', raw => {
    const { storage, local, profiles } = setup({ [STORAGE_KEY]: raw });
    profiles.createProfile('Session');
    expect(storage.status().blocked).toBe(true);
    expect(storage.enable()).toBe(false);
    expect(local.getItem(STORAGE_KEY)).toBe(raw);
  });
  test('protects unknown future schema against writes', () => {
    const raw = JSON.stringify({ schemaVersion: 99, data: 'future' });
    const { storage, local, profiles } = setup({ [STORAGE_KEY]: raw });
    profiles.createProfile('Session');
    expect(storage.status().reason).toBe('future');
    expect(local.getItem(STORAGE_KEY)).toBe(raw);
  });
  test('migrates supported schema 1 in memory and on next meaningful save', () => {
    const raw = JSON.stringify({ schemaVersion: 1, profiles: [legacyProfile], activeProfileId: 'anna', fingerGuide: false });
    const { profiles, local } = setup({ [STORAGE_KEY]: raw });
    expect(profiles.getActiveProfile()).toMatchObject({ difficulty: 1, guideEnabled: false, courses: {}, history: [] });
    profiles.updateActiveProfileSettings({ difficulty: 2 });
    expect(JSON.parse(local.getItem(STORAGE_KEY)).schemaVersion).toBe(2);
  });
  test.each([
    { difficulty: 9 }, { guideEnabled: 'false' }, { keyboardModel: 'invented' }, { languageLayout: 'xx' }, { id: '../evil' }, { name: '' }, { history: new Array(101).fill(result()) }, { courses: { 'xx': {} } }, { createdAt: 'yesterday' }
  ])('rejects malformed profile %j', changes => {
    const { profiles, storage } = setup(); profiles.createProfile('Anna');
    const data = storage.read(); Object.assign(data.profiles[0], changes);
    expect(() => parseData(JSON.stringify(data))).toThrow();
  });
  test('rejects invalid active profile, duplicate IDs and bogus metrics', () => {
    const { profiles, storage } = setup(); profiles.createProfile('Anna');
    const data = storage.read();
    expect(() => parseData(JSON.stringify({ ...data, activeProfileId: 'missing' }))).toThrow();
    expect(() => parseData(JSON.stringify({ ...data, profiles: [data.profiles[0], data.profiles[0]] }))).toThrow();
    expect(() => profiles.recordResult(result(1, { accuracy: 99 }))).toThrow();
    expect(() => profiles.recordResult(result(1, { language: 'cs-cz', lessonId: 'space-rhythm' }))).toThrow();
  });
  test('continues in memory when reading storage throws', () => {
    const { storage, profiles } = setup({}, { getStorage: () => { throw new Error('SecurityError'); } });
    profiles.createProfile('Memory');
    expect(profiles.getActiveProfile().name).toBe('Memory');
    expect(storage.status().reason).toBe('read-error');
  });
  test('preserves live state and reports quota failure', () => {
    const { storage, profiles, local } = setup(); storage.enable();
    local.setItem = () => { throw new Error('QuotaExceededError'); };
    profiles.createProfile('Memory');
    expect(profiles.getActiveProfile().name).toBe('Memory');
    expect(storage.status()).toMatchObject({ persistent: false, reason: 'write-error' });
  });
  test('detects silent writes that fail read-back verification', () => {
    const { storage } = setup({}, { getStorage: () => ({ ...fakeLocal(), setItem: () => {} }) });
    expect(storage.enable()).toBe(false);
    expect(storage.status().reason).toBe('write-error');
  });
  test('transfers valid legacy cookies and deletes them only after read-back', () => {
    const { storage, profiles, deleted, local } = setup({}, { readCookies: () => cookies });
    expect(profiles.listProfiles()).toHaveLength(0);
    expect(deleted).toHaveLength(0);
    expect(storage.enable()).toBe(true);
    expect(profiles.getActiveProfile()).toMatchObject({ id: 'anna', name: 'Anna', languageLayout: 'cs-cz', guideEnabled: false });
    expect(parseData(local.getItem(STORAGE_KEY)).profiles).toHaveLength(1);
    expect(deleted).toContain('strojopis_profile_anna');
    expect(deleted).toContain('strojopis_finger_guide');
  });
  test('failed migration keeps all cookies intact', () => {
    const { storage, deleted, local } = setup({}, { readCookies: () => cookies });
    local.setItem = () => { throw new Error('full'); };
    expect(storage.enable()).toBe(false);
    expect(deleted).toEqual([]);
  });
  test('migrates original single-profile cookie and ignores invalid profiles', () => {
    const { storage, profiles } = setup({}, { readCookies: () => cookieString({ strojopis_active_profile: { name: 'Old' } }) });
    storage.enable(); expect(profiles.getActiveProfile().name).toBe('Old');
    const invalid = setup({}, { readCookies: () => cookieString({ strojopis_profiles_index: ['bad'], strojopis_profile_bad: { name: '' } }) });
    invalid.storage.enable(); expect(invalid.deleted).not.toContain('strojopis_profile_bad');
  });
  test('deletes one profile independently and all owned data without foreign keys', () => {
    const { profiles, storage, local } = setup({ foreign: 'keep' });
    profiles.createProfile('A'); profiles.createProfile('B'); storage.enable();
    profiles.deleteActiveProfile(); expect(profiles.listProfiles().map(p => p.name)).toEqual(['A']);
    local.setItem('strojopis_old', 'owned');
    expect(storage.clear()).toBe(true);
    expect(storage.read()).toEqual(emptyData()); expect(local.length).toBe(1); expect(local.getItem('foreign')).toBe('keep');
  });
  test('turning off remembering removes persisted data and retains memory', () => {
    const { profiles, storage, local } = setup(); profiles.createProfile('A'); storage.enable();
    expect(storage.disable()).toBe(true); expect(local.getItem(STORAGE_KEY)).toBeNull(); expect(profiles.listProfiles()).toHaveLength(1);
  });
});
