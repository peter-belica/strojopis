import { COURSE_LESSON_IDS, LANGUAGES, MODELS, KEYBOARD_LOCALE_IDS, KEYBOARD_PLATFORM_IDS, resultFormat, validateResult } from './data-model.js';
/** @typedef {import('./types').Profile} Profile */
/** @param {ReturnType<typeof import('./storage').createStorage>} storage */
export function createProfileManager(storage) {
  const listProfiles = () => storage.read().profiles;
  const getActiveProfile = () => { const data = storage.read(); return data.profiles.find(p => p.id === data.activeProfileId) ?? null; };
  function change(action) {
    const data = storage.read();
    action(data);
    storage.save(data);
    return getActiveProfile();
  }
  function setActiveProfile(id) {
    return change(data => { if (data.profiles.some(p => p.id === id)) data.activeProfileId = id; });
  }
  function createProfile(name, settings = {}) {
    const cleaned = name.trim().slice(0, 60);
    if (!cleaned) throw new Error('Zadaj prezývku.');
    if (listProfiles().length >= 50) throw new Error('V tomto prehliadači môže byť najviac 50 profilov.');
    const stamp = new Date().toISOString();
    const id = `p-${crypto.randomUUID()}`;
    change(data => {
      data.profiles.push({ id, name: cleaned, keyboardModel: 'macbook-air', languageLayout: 'en-gb', keyboardLocale: 'sk-sk', keyboardPlatform: 'mac', difficulty: 1, guideEnabled: true, ...settings, createdAt: stamp, updatedAt: stamp, courses: {}, history: [] });
      data.activeProfileId = id;
    });
    return getActiveProfile();
  }
  function updateActiveProfileSettings(settings) {
    return change(data => {
      const p = data.profiles.find(p => p.id === data.activeProfileId);
      if (!p) return;
      if (MODELS.includes(settings.keyboardModel)) p.keyboardModel = settings.keyboardModel;
      if (LANGUAGES.includes(settings.languageLayout)) p.languageLayout = settings.languageLayout;
      if (KEYBOARD_LOCALE_IDS.includes(settings.keyboardLocale)) p.keyboardLocale = settings.keyboardLocale;
      if (KEYBOARD_PLATFORM_IDS.includes(settings.keyboardPlatform)) p.keyboardPlatform = settings.keyboardPlatform;
      if ([1,2,3,4].includes(settings.difficulty)) p.difficulty = settings.difficulty;
      if (typeof settings.guideEnabled === 'boolean') p.guideEnabled = settings.guideEnabled;
      p.updatedAt = new Date().toISOString();
    });
  }
  function selectLesson(language, id) {
    return change(data => {
      const p = data.profiles.find(p => p.id === data.activeProfileId);
      if (!p || !COURSE_LESSON_IDS[language]?.includes(id)) return;
      p.courses[language] ??= { lastLessonId: id, lessons: {} };
      p.courses[language].lastLessonId = id;
    });
  }
  /** Completion is idempotent, including repeated UI renders. */
  function recordResult(result) {
    const valid = validateResult(result, result.language);
    return change(data => {
      const p = data.profiles.find(p => p.id === data.activeProfileId);
      if (!p || p.history.some(r => r.id === valid.id)) return;
      p.courses[valid.language] ??= { lastLessonId: valid.lessonId, lessons: {} };
      const course = p.courses[valid.language];
      const previous = course.lessons[valid.lessonId];
      const bestByFormat = { ...previous?.bestByFormat };
      if (previous?.bestResult) bestByFormat[resultFormat(previous.bestResult)] ??= previous.bestResult;
      const format = resultFormat(valid);
      const best = bestByFormat[format];
      // Different random sentences have different lengths. Compare time per character,
      // and keep old one-sentence formats separate from the longer exercises.
      const better = !best || valid.accuracy > best.accuracy || (valid.accuracy === best.accuracy && valid.durationMs / valid.length < best.durationMs / best.length);
      bestByFormat[format] = better ? valid : best;
      course.lessons[valid.lessonId] = { completedAttempts: (previous?.completedAttempts ?? 0) + 1, bestResult: bestByFormat[format], lastResult: valid, bestByFormat };
      p.history = [...p.history, valid].slice(-100);
      p.updatedAt = valid.completedAt;
    });
  }
  function deleteActiveProfile() {
    return change(data => {
      data.profiles = data.profiles.filter(p => p.id !== data.activeProfileId);
      data.activeProfileId = data.profiles[0]?.id ?? null;
    });
  }
  return { listProfiles, getActiveProfile, createProfile, setActiveProfile, updateActiveProfileSettings, selectLesson, recordResult, deleteActiveProfile };
}
