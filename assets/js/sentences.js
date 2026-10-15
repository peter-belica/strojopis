import { LANGUAGES } from './data-model.js';
export const DIFFICULTIES = [
  { name: 'Veľmi jednoduché', audience: 'orientačne 6–8 rokov', min: 3, max: 7 },
  { name: 'Jednoduché', audience: 'orientačne 8–12 rokov', min: 6, max: 12 },
  { name: 'Stredne náročné', audience: 'orientačne 12–16 rokov', min: 10, max: 20 },
  { name: 'Náročné', audience: 'pre dospelých', min: 12, max: 30 }
];
/** @param {import('./types').Sentence[]} sentences */
export function validateSentences(sentences) {
  const problems = [], ids = new Set(), texts = new Set();
  if (!Array.isArray(sentences)) return ['Obsah nie je zoznam.'];
  for (const s of sentences) {
    if (!s || typeof s.id !== 'string' || !/^[a-z0-9-]+$/.test(s.id) || ids.has(s.id)) problems.push(`Neplatné alebo duplicitné id: ${s?.id}`);
    ids.add(s?.id);
    if (!LANGUAGES.includes(s?.language) || ![1,2,3,4].includes(s?.difficulty)) problems.push(`Neplatný jazyk alebo úroveň: ${s?.id}`);
    if (typeof s?.text !== 'string' || !s.text.trim() || s.text !== s.text.normalize('NFC') || /[\r\n]/.test(s.text)) { problems.push(`Neplatný text: ${s?.id}`); continue; }
    const key = `${s.language}:${s.text.trim().toLocaleLowerCase()}`;
    if (texts.has(key)) problems.push(`Duplicitná veta: ${s.id}`);
    texts.add(key);
    const rule = DIFFICULTIES[s.difficulty - 1];
    const words = s.text.trim().split(/\s+/).length;
    if (rule && (words < rule.min || words > rule.max)) problems.push(`Počet slov ${words} mimo ${rule.min}–${rule.max}: ${s.id}`);
    if (!Array.isArray(s.topics) || !s.topics.length || s.topics.some(t => typeof t !== 'string' || !t)) problems.push(`Chýba téma: ${s.id}`);
    if (!/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(s.text) || !/[.!?]$/.test(s.text)) problems.push(`Interpunkcia vety: ${s.id}`);
  }
  for (const language of LANGUAGES) for (const difficulty of [1,2,3,4]) {
    const count = sentences.filter(s => s?.language === language && s?.difficulty === difficulty).length;
    if (count < 30) problems.push(`${language}, úroveň ${difficulty}: iba ${count} viet.`);
  }
  return problems;
}
/** The RNG (random number generator) is injectable; characters include case and punctuation.
 * @param {import('./types').Sentence[]} sentences
 * @param {{language: import('./types').Language, difficulty:number, allowedCharacters?:string[]|null, previousId?:string|null}} options
 * @param {() => number} random
 */
export function selectSentence(sentences, { language, difficulty, allowedCharacters = null, previousId = null }, random = Math.random) {
  const allowed = allowedCharacters === null ? null : new Set(allowedCharacters);
  const candidates = sentences.filter(s => s.language === language && s.difficulty === difficulty && (!allowed || Array.from(s.text).every(c => allowed.has(c))));
  const fresh = candidates.length > 1 ? candidates.filter(s => s.id !== previousId) : candidates;
  return fresh[Math.min(fresh.length - 1, Math.max(0, Math.floor(random() * fresh.length)))] ?? null;
}
