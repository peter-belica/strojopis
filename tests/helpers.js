import { createStorage } from '../assets/js/storage.js';
import { createProfileManager } from '../assets/js/profiles.js';
export function fakeLocal(initial = {}) {
  const map = new Map(Object.entries(initial));
  return { get length() { return map.size; }, key: i => [...map.keys()][i] ?? null, getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key), clear: () => map.clear() };
}
export function setup(initial = {}, extra = {}) {
  const local = fakeLocal(initial);
  const deleted = [];
  const storage = createStorage({ getStorage: () => local, readCookies: () => '', deleteCookie: key => deleted.push(key), ...extra });
  return { local, storage, deleted, profiles: createProfileManager(storage) };
}
export const result = (i = 1, changes = {}) => ({ id: `r-${i}`, lessonId: 'home-left', textId: 'home-left', language: 'en-gb', difficulty: 1, attempts: 5, errors: 1, length: 4, accuracy: 80, durationMs: 1500, completedAt: new Date().toISOString(), ...changes });
