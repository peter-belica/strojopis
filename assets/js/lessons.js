import { selectSentence } from './sentences.js';
/** @param {string} text @param {import('./types').KeyboardLayout['charMap']} charMap */
export function targetsFromText(text, charMap) {
  return Array.from(text.normalize('NFC')).map(char => {
    // Missing mappings stay unknown, particularly composed national capitals.
    const mapping = charMap[char] ?? {};
    return { char, code: mapping.code ?? '', shift: Boolean(mapping.shift), altGraph: Boolean(mapping.altGraph) };
  });
}
/** @param {import('./types').Course} course @param {import('./types').KeyboardLayout} layout */
export function normalizeCourse(course, layout) {
  const allowed = new Set();
  return course.lessons.map(lesson => {
    for (const c of lesson.introducedCharacters) allowed.add(c);
    const text = lesson.blocks.filter(b => ['drill','words'].includes(b.type))
      .flatMap(b => b.text.split(/\s+/))
      .filter(word => Array.from(word).every(c => allowed.has(c))).join(' ');
    return { ...lesson, text, allowedCharacters: [...allowed], targets: targetsFromText(text, layout.charMap) };
  });
}
/** @param {import('./types').Lesson} lesson
 * @param {import('./types').Sentence[]} sentences
 * @param {import('./types').Language} language
 * @param {number} difficulty
 * @param {import('./types').KeyboardLayout} layout
 * @param {string} [previousId]
 * @returns {import('./types').Lesson}
 */
export function prepareExercise(lesson, sentences, language, difficulty, layout, previousId) {
  const free = lesson.id === 'free-practice';
  const sentence = selectSentence(sentences, { language, difficulty, allowedCharacters: free ? null : lesson.allowedCharacters, previousId });
  const text = sentence?.text ?? lesson.text;
  return { ...lesson, text, targets: targetsFromText(text, layout.charMap), textId: sentence?.id ?? lesson.id, difficulty, fallback: !sentence && !free };
}
/** @param {import('./types').Course} course @param {import('./types').KeyboardLayout} layout */
export function validateCourse(course, layout) {
  const problems = [], ids = new Set();
  if (!course?.id || !course.lessons?.length) return ['Chýba kurz alebo lekcie.'];
  for (const lesson of normalizeCourse(course, layout)) {
    if (!lesson.id || ids.has(lesson.id)) problems.push(`Neplatná lekcia: ${lesson.id}`);
    ids.add(lesson.id);
    if (!lesson.text) problems.push(`Chýba bezpečné cvičenie: ${lesson.id}`);
    for (const c of lesson.text) if (!Object.hasOwn(layout.charMap, c)) problems.push(`Chýba mapovanie ${c} v ${lesson.id}`);
  }
  return problems;
}
