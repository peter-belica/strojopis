import { selectSentences } from './sentences.js';
import { SENTENCE_COUNTS } from './data-model.js';
/** @param {string} text @param {import('./types').KeyboardLayout['charMap']} charMap */
export function targetsFromText(text, charMap) {
  return Array.from(text.normalize('NFC')).map(char => {
    // Missing mappings stay unknown, particularly composed national capitals.
    const mapping = charMap[char] ?? {};
    return { char, ...mapping, code: mapping.code ?? '', shift: Boolean(mapping.shift), altGraph: Boolean(mapping.altGraph) };
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
 * @param {() => number} [random]
 * @returns {import('./types').Lesson}
 */
export function prepareExercise(lesson, sentences, language, difficulty, layout, previousId, random = Math.random) {
  const free = lesson.id === 'free-practice';
  const selected = selectSentences(sentences, { language, difficulty, allowedCharacters: free ? null : lesson.allowedCharacters, previousId }, random);
  const sentenceEnds = [];
  let offset = 0;
  for (const sentence of selected) {
    offset += (sentenceEnds.length ? 1 : 0) + Array.from(sentence.text.normalize('NFC')).length;
    sentenceEnds.push(offset);
  }
  // Repeat only the safe lesson drill when there are too few compatible sentences.
  // A separator is introduced only if space has already been taught.
  const separator = free || lesson.allowedCharacters?.includes(' ') ? ' ' : '';
  const text = (selected.length ? selected.map(s => s.text).join(' ') : Array(SENTENCE_COUNTS[difficulty - 1]).fill(lesson.text).join(separator)).normalize('NFC');
  return { ...lesson, text, targets: targetsFromText(text, layout.charMap), textId: selected[0]?.id ?? lesson.id,
    textIds: selected.map(s => s.id), sentenceCount: selected.length, sentenceEnds, exerciseVersion: 3,
    difficulty, fallback: selected.length === 0 };
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
