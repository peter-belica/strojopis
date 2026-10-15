import { emptyData, parseData, validateProfile } from './data-model.js';
export const STORAGE_KEY = 'strojopis_data';
const LEGACY_INDEX = 'strojopis_profiles_index';
const LEGACY_ACTIVE = 'strojopis_active_profile_id';
const LEGACY_SINGLE = 'strojopis_active_profile';
const LEGACY_GUIDE = 'strojopis_finger_guide';

function cookieMap(raw) {
  const entries = new Map();
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    try { entries.set(decodeURIComponent(part.slice(0, i).trim()), decodeURIComponent(part.slice(i + 1))); } catch { /* Ignore unrelated broken cookies. */ }
  }
  return entries;
}
const jsonCookie = (cookies, key, fallback) => { try { return JSON.parse(cookies.get(key) ?? 'null') ?? fallback; } catch { return fallback; } };

/** Native persistence is only enabled by an existing record or explicit user action.
 * All storage and cookie access is injectable for failure tests.
 * @param {{getStorage?: () => Storage, readCookies?: () => string, deleteCookie?: (name: string) => void}} options
 */
export function createStorage(options = {}) {
  const getStorage = options.getStorage ?? (() => window.localStorage);
  const readCookies = options.readCookies ?? (() => document.cookie);
  const deleteCookie = options.deleteCookie ?? (name => {
    for (const path of ['/', location.pathname.replace(/[^/]*$/, '')]) {
      document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=${path}; SameSite=Strict`;
    }
  });
  let data = emptyData();
  let persistent = false;
  let blocked = false;
  let reason = 'memory';
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (raw !== null) { data = parseData(raw); persistent = true; reason = 'saved'; }
  } catch (error) {
    blocked = true;
    reason = error.message === 'future-version' ? 'future' : 'read-error';
  }
  const status = () => ({ persistent, blocked, reason });
  const read = () => structuredClone(data);

  function verifiedWrite(next) {
    const local = getStorage();
    const raw = JSON.stringify(next);
    local.setItem(STORAGE_KEY, raw);
    if (local.getItem(STORAGE_KEY) !== raw) throw new Error('Zápis sa nepotvrdil.');
    parseData(raw);
  }
  function save(next) {
    // Validate before replacing the working in-memory state.
    data = parseData(JSON.stringify(next));
    if (persistent) {
      try { verifiedWrite(data); } catch { persistent = false; reason = 'write-error'; }
    }
  }

  function legacyData() {
    const cookies = cookieMap(readCookies());
    const ids = jsonCookie(cookies, LEGACY_INDEX, []);
    const guide = jsonCookie(cookies, LEGACY_GUIDE, true) !== false;
    const profiles = [];
    const migratedKeys = [];
    const legacyProfiles = Array.isArray(ids) ? ids.slice(0, 50).map(id => [id, jsonCookie(cookies, `strojopis_profile_${id}`, null), `strojopis_profile_${id}`]) : [];
    const single = jsonCookie(cookies, LEGACY_SINGLE, null);
    if (!legacyProfiles.length && single) legacyProfiles.push(['legacy', single, LEGACY_SINGLE]);
    for (const [id, p, sourceKey] of legacyProfiles) {
      try {
        const stamp = new Date().toISOString();
        const profile = validateProfile({ ...p, id, languageLayout: ['cs-cz','en-gb'].includes(p.languageLayout) ? p.languageLayout : 'en-gb', keyboardModel: p.keyboardModel ?? 'macbook-air', difficulty: 1, guideEnabled: guide, courses: {}, history: [], createdAt: p.createdAt ?? stamp, updatedAt: stamp });
        if (!profiles.some(item => item.id === profile.id)) profiles.push(profile);
        migratedKeys.push(sourceKey);
      } catch { /* Invalid legacy profiles remain untouched. */ }
    }
    const active = jsonCookie(cookies, LEGACY_ACTIVE, null);
    return { profiles, active, keys: profiles.length ? [...migratedKeys, ...(profiles.length === legacyProfiles.length ? [LEGACY_INDEX, LEGACY_ACTIVE, LEGACY_GUIDE] : [])] : [] };
  }

  function enable() {
    if (blocked) return false;
    try {
      const legacy = legacyData();
      const next = read();
      for (const profile of legacy.profiles) {
        if (!next.profiles.some(p => p.id === profile.id) && next.profiles.length < 50) next.profiles.push(profile);
      }
      next.activeProfileId ??= next.profiles.find(p => p.id === legacy.active)?.id ?? next.profiles[0]?.id ?? null;
      verifiedWrite(next);
      data = next;
      persistent = true;
      reason = 'saved';
      // Never delete source cookies until the complete record was read back successfully.
      for (const key of legacy.keys) { try { deleteCookie(key); } catch { /* A different cookie path may be inaccessible. */ } }
      return true;
    } catch { persistent = false; reason = 'write-error'; return false; }
  }

  function disable() {
    try { getStorage().removeItem(STORAGE_KEY); persistent = false; reason = 'memory'; return true; }
    catch { persistent = false; reason = 'delete-error'; return false; }
  }
  function clear() {
    data = emptyData();
    try {
      const local = getStorage();
      const keys = Array.from({length: local.length}, (_, i) => local.key(i));
      for (const key of keys) if (key === STORAGE_KEY || key?.startsWith('strojopis_')) local.removeItem(key);
      const cookies = cookieMap(readCookies());
      for (const key of cookies.keys()) if (key.startsWith('strojopis_')) deleteCookie(key);
      data = emptyData(); persistent = false; blocked = false; reason = 'memory';
      return true;
    } catch { reason = 'delete-error'; persistent = false; return false; }
  }
  return { read, save, enable, disable, clear, status };
}
