/** @typedef {import('./types').AppData} AppData */
/** @typedef {import('./types').Profile} Profile */
/** @typedef {import('./types').TrainingResult} TrainingResult */
export const SCHEMA_VERSION = 4;
export const SENTENCE_COUNTS = [3, 6, 9, 12];
export const LANGUAGES = ['cs-cz', 'en-gb'];
export const KEYBOARD_LOCALE_IDS = ['sk-sk', 'cs-cz', 'es-es', 'en-us', 'en-gb'];
export const KEYBOARD_PLATFORM_IDS = ['mac', 'windows'];
export const MODELS = ['macbook-air', 'macbook-air-ansi', 'dell-xps-2018', 'dell-xps-2018-ansi'];
export const LESSON_IDS = ['home-left', 'home-right', 'home-row', 'top-left', 'top-right', 'top-row', 'bottom-left', 'bottom-right', 'all-letters', 'space-rhythm', 'vowels-diacritics', 'caron-diacritics', 'capitals', 'punctuation', 'apostrophes', 'numbers', 'symbols', 'short-texts', 'free-practice'];
export const COURSE_LESSON_IDS = {
  'en-gb': LESSON_IDS.filter(id => !['vowels-diacritics', 'caron-diacritics'].includes(id)),
  'cs-cz': LESSON_IDS.filter(id => !['space-rhythm', 'apostrophes'].includes(id))
};
export const emptyData = () => /** @type {AppData} */ ({ schemaVersion: SCHEMA_VERSION, activeProfileId: null, profiles: [] });
export const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
const identifier = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
const date = value => typeof value === 'string' && value.length <= 30 && Number.isFinite(Date.parse(value));
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };

/** Validate and copy only known fields from an untrusted result. @returns {TrainingResult} */
export function validateResult(r, language) {
  requireValue(isObject(r) && identifier(r.id) && COURSE_LESSON_IDS[language]?.includes(r.lessonId), 'Neplatný výsledok.');
  requireValue(r.language === language && identifier(r.textId) && integer(r.difficulty, 1, 4), 'Neplatný jazyk alebo text výsledku.');
  requireValue(integer(r.attempts, 1, 1000000) && integer(r.errors, 0, r.attempts - 1) && integer(r.length, 1, 10000) && r.attempts - r.errors === r.length, 'Neplatné počty výsledku.');
  requireValue(r.accuracy === Math.round((r.attempts - r.errors) / r.attempts * 100) && integer(r.durationMs, 0, 86400000) && date(r.completedAt), 'Neplatné metriky.');
  const exerciseVersion = r.exerciseVersion ?? 1;
  const sentenceCount = r.sentenceCount ?? 0;
  const textIds = r.textIds ?? [];
  requireValue(integer(exerciseVersion, 1, 3) && integer(sentenceCount, 0, exerciseVersion === 3 ? 12 : 4), 'Neplatný formát cvičenia.');
  requireValue(Array.isArray(textIds) && textIds.length <= (exerciseVersion === 3 ? 12 : 4) && textIds.every(identifier) && new Set(textIds).size === textIds.length, 'Neplatné vety cvičenia.');
  const expectedCount = exerciseVersion === 3 ? SENTENCE_COUNTS[r.difficulty - 1] : r.difficulty;
  requireValue(exerciseVersion === 1 || textIds.length === sentenceCount && (sentenceCount === 0 || sentenceCount === expectedCount) && (!sentenceCount || textIds[0] === r.textId), 'Nesúlad počtu viet.');
  return { id: r.id, lessonId: r.lessonId, textId: r.textId, textIds: [...textIds], sentenceCount, exerciseVersion, language, difficulty: r.difficulty, attempts: r.attempts, errors: r.errors, length: r.length, accuracy: r.accuracy, durationMs: r.durationMs, completedAt: r.completedAt };
}

export const resultFormat = result => `v${result.exerciseVersion ?? 1}-d${result.difficulty}-s${result.sentenceCount ?? 0}`;

/** @returns {Profile} */
export function validateProfile(p) {
  requireValue(isObject(p) && identifier(p.id) && typeof p.name === 'string' && p.name.trim().length > 0 && p.name.length <= 60, 'Neplatný profil.');
  requireValue(MODELS.includes(p.keyboardModel) && LANGUAGES.includes(p.languageLayout), 'Neplatné nastavenia profilu.');
  requireValue(KEYBOARD_LOCALE_IDS.includes(p.keyboardLocale) && KEYBOARD_PLATFORM_IDS.includes(p.keyboardPlatform), 'Neplatné mapovanie klávesnice.');
  requireValue(integer(p.difficulty, 1, 4) && typeof p.guideEnabled === 'boolean' && date(p.createdAt) && date(p.updatedAt), 'Neplatná náročnosť alebo dátum.');
  requireValue(isObject(p.courses) && Array.isArray(p.history) && p.history.length <= 100, 'Neplatný progres.');
  /** @type {Profile['courses']} */
  const courses = {};
  for (const [language, progress] of Object.entries(p.courses)) {
    requireValue(LANGUAGES.includes(language) && isObject(progress) && COURSE_LESSON_IDS[language].includes(progress.lastLessonId) && isObject(progress.lessons), 'Neplatný kurz.');
    const lessons = {};
    for (const [id, summary] of Object.entries(progress.lessons)) {
      requireValue(COURSE_LESSON_IDS[language].includes(id) && isObject(summary) && integer(summary.completedAttempts, 1, 100000000), 'Neplatný súhrn.');
      const bestResult = validateResult(summary.bestResult, language);
      const lastResult = validateResult(summary.lastResult, language);
      requireValue(bestResult.lessonId === id && lastResult.lessonId === id, 'Nesúlad lekcie.');
      const rawBests = summary.bestByFormat ?? { [resultFormat(bestResult)]: bestResult };
      requireValue(isObject(rawBests) && Object.keys(rawBests).length <= 40, 'Neplatné rekordy cvičenia.');
      const bestByFormat = {};
      for (const [format, rawResult] of Object.entries(rawBests)) {
        const best = validateResult(rawResult, language);
        requireValue(format === resultFormat(best) && best.lessonId === id, 'Nesúlad formátu rekordu.');
        bestByFormat[format] = best;
      }
      lessons[id] = { completedAttempts: summary.completedAttempts, bestResult, lastResult, bestByFormat };
    }
    courses[language] = { lastLessonId: progress.lastLessonId, lessons };
  }
  const history = p.history.map(r => validateResult(r, r.language));
  requireValue(new Set(history.map(r => r.id)).size === history.length, 'Opakované výsledky.');
  return { id: p.id, name: p.name.trim(), keyboardModel: p.keyboardModel, languageLayout: p.languageLayout, keyboardLocale: p.keyboardLocale, keyboardPlatform: p.keyboardPlatform, difficulty: p.difficulty, guideEnabled: p.guideEnabled, createdAt: p.createdAt, updatedAt: p.updatedAt, courses, history };
}

/** Supported v1 had profile settings but no result summaries. @returns {AppData} */
export function parseData(raw) {
  const data = JSON.parse(raw);
  requireValue(isObject(data), 'Neplatný záznam.');
  if (data.schemaVersion > SCHEMA_VERSION) throw new Error('future-version');
  requireValue([1, 2, 3, 4].includes(data.schemaVersion) && Array.isArray(data.profiles) && data.profiles.length <= 50, 'Nepodporovaný formát.');
  const profiles = data.profiles.map(rawProfile => {
    const p = data.schemaVersion === 1 ? { ...rawProfile, updatedAt: rawProfile.updatedAt ?? rawProfile.createdAt, difficulty: rawProfile.difficulty ?? 1, guideEnabled: rawProfile.guideEnabled ?? data.fingerGuide ?? true, courses: {}, history: [] } : rawProfile;
    return validateProfile(data.schemaVersion < 3 ? { ...p, keyboardLocale: p.languageLayout, keyboardPlatform: p.keyboardModel?.startsWith('dell-') ? 'windows' : 'mac' } : p);
  });
  requireValue(new Set(profiles.map(p => p.id)).size === profiles.length, 'Opakované profily.');
  requireValue(data.activeProfileId === null || profiles.some(p => p.id === data.activeProfileId), 'Neplatný aktívny profil.');
  return { schemaVersion: SCHEMA_VERSION, activeProfileId: data.activeProfileId, profiles };
}
