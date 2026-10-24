import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeCourse, prepareExercise, targetsFromText } from '../assets/js/lessons.js';
import { selectSentences } from '../assets/js/sentences.js';
import { createTypingEngine } from '../assets/js/typing-engine.js';

const read = path => JSON.parse(readFileSync(new URL(`../content/${path}`, import.meta.url), 'utf8'));
const corpus = ['cs-cz', 'en-gb'].flatMap(language => read(`sentences/${language}.json`));
const base = { id: 'free-practice', name: 'Practice', phase: '', description: '', text: 'safe drill', targets: [] };

test.each(['cs-cz', 'en-gb'])('difficulty levels select 3, 6, 9 and 12 distinct sentences: %s', language => {
  const layout = read(`keyboard-layouts/${language}.json`);
  for (const difficulty of [1, 2, 3, 4]) {
    const count = difficulty * 3;
    const exercise = prepareExercise(base, corpus, language, difficulty, layout, undefined, () => 0);
    const sentences = exercise.textIds.map(id => corpus.find(s => s.id === id));
    expect(sentences).toHaveLength(count);
    expect(new Set(exercise.textIds).size).toBe(count);
    expect(sentences.every(s => s.language === language && s.difficulty === difficulty)).toBe(true);
    expect(exercise.text).toBe(sentences.map(s => s.text).join(' '));
    expect(exercise.targets.map(t => t.char).join('')).toBe(exercise.text);
    expect(exercise.targets).toHaveLength(sentences.reduce((n, s) => n + Array.from(s.text).length, 0) + count - 1);
    expect(exercise).toMatchObject({ textId: sentences[0].id, sentenceCount: count, exerciseVersion: 3, fallback: false });
    let offset = 0;
    expect(exercise.sentenceEnds).toEqual(sentences.map((s, i) => offset += Array.from(s.text).length + (i ? 1 : 0)));
    for (const boundary of exercise.sentenceEnds.slice(0, -1)) expect(exercise.targets[boundary].char).toBe(' ');
    const next = prepareExercise(base, corpus, language, difficulty, layout, exercise.textId, () => 0);
    expect(next.textId).not.toBe(exercise.textId);
  }
});

test('selection is deterministic with an injected generator and never duplicates a sentence', () => {
  const options = { language: 'en-gb', difficulty: 4 };
  const first = selectSentences(corpus, options, () => 0);
  expect(selectSentences(corpus, options, () => 0)).toEqual(first);
  expect(selectSentences(corpus, options, () => 0.99)).not.toEqual(first);
  const pool = corpus.filter(s => s.language === 'en-gb' && s.difficulty === 4).slice(0, 12);
  expect(new Set(selectSentences(pool, { ...options, previousId: pool[0].id }, () => 0).map(s => s.id)).size).toBe(12);
});

test.each(['cs-cz', 'en-gb'])('early drills scale safely at every difficulty: %s', language => {
  const layout = read(`keyboard-layouts/${language}.json`);
  const lesson = normalizeCourse(read(`courses/${language}.json`), layout)[0];
  for (const difficulty of [1, 2, 3, 4]) {
    const exercise = prepareExercise(lesson, corpus, language, difficulty, layout, undefined, () => 0);
    expect(exercise).toMatchObject({ fallback: true, textIds: [], sentenceCount: 0, sentenceEnds: [], exerciseVersion: 3 });
    expect(exercise.text).toBe(Array(difficulty * 3).fill(lesson.text).join(' '));
    expect(Array.from(exercise.text).every(c => lesson.allowedCharacters.includes(c))).toBe(true);
  }
});

test('an insufficient pool falls back completely, including when some compatible sentences exist', () => {
  const layout = read('keyboard-layouts/en-gb.json');
  for (const difficulty of [1, 2, 3, 4]) {
    const pool = corpus.filter(s => s.language === 'en-gb' && s.difficulty === difficulty).slice(0, difficulty * 3 - 1);
    const lesson = { ...base, id: 'progressive', allowedCharacters: [...new Set('safe drill' + pool.map(s => s.text).join(''))] };
    const exercise = prepareExercise(lesson, pool, 'en-gb', difficulty, layout, undefined, () => 0);
    expect(exercise).toMatchObject({ fallback: true, sentenceCount: 0, textIds: [], sentenceEnds: [], textId: lesson.id });
    expect(exercise.text).toBe(Array(difficulty * 3).fill(lesson.text).join(' '));
  }
});

test('fallback never adds an untaught separator', () => {
  const lesson = { ...base, id: 'early', text: 'fff', allowedCharacters: ['f'] };
  expect(prepareExercise(lesson, [], 'en-gb', 4, { charMap: {} }).text).toBe('f'.repeat(36));
});

test('progressive batches require every taught character, including the joining space', () => {
  const pool = [
    { id: 'one', language: 'en-gb', difficulty: 2, text: 'A.', topics: [] },
    ...['B', 'C', 'D', 'E', 'F'].map(char => ({ id: char.toLowerCase(), language: 'en-gb', difficulty: 2, text: `${char}.`, topics: [] }))
  ];
  const options = { language: 'en-gb', difficulty: 2, allowedCharacters: ['A', 'B', 'C', 'D', 'E', 'F', '.', ' '] };
  expect(selectSentences(pool, options, () => 0)).toHaveLength(6);
  for (const excluded of options.allowedCharacters) {
    expect(selectSentences(pool, { ...options, allowedCharacters: options.allowedCharacters.filter(c => c !== excluded) }, () => 0)).toEqual([]);
  }
});

test('NFC character boundaries and keyboard stroke sequences survive exercise preparation', () => {
  const steps = [{ code: 'BracketLeft', dead: true }, { code: 'KeyA', modifiers: ['Shift'] }];
  const layout = { charMap: { 'á': { code: 'KeyA', steps } } };
  const sentences = [
    { id: 'one', language: 'en-gb', difficulty: 2, text: 'a\u0301.', topics: [] },
    ...['B', 'C', 'D', 'E', 'F'].map(char => ({ id: char.toLowerCase(), language: 'en-gb', difficulty: 2, text: `${char}.`, topics: [] }))
  ];
  const exercise = prepareExercise(base, sentences, 'en-gb', 2, layout, undefined, () => 0);
  expect(exercise.text).toBe('á. B. C. D. E. F.');
  expect(exercise.sentenceEnds).toEqual([2, 5, 8, 11, 14, 17]);
  expect(exercise.targets[0].steps).toEqual(steps);
  expect(targetsFromText('á', layout.charMap)[0].steps).toEqual(steps);
});

test('typing the first sentence does not complete a multiple sentence exercise', () => {
  const exercise = prepareExercise(base, corpus, 'en-gb', 4, read('keyboard-layouts/en-gb.json'), undefined, () => 0);
  const engine = createTypingEngine([exercise], () => 100);
  const firstEnd = exercise.sentenceEnds[0];
  const chars = Array.from(exercise.text);
  const partial = engine.handleText(chars.slice(0, firstEnd).join(''));
  expect(partial.isComplete).toBe(false);
  expect(partial.currentTarget.char).toBe(' ');
  expect(engine.claimResult('en-gb')).toBeNull();
  expect(engine.handleText(chars.slice(firstEnd).join('')).isComplete).toBe(true);
  expect(engine.claimResult('en-gb').length).toBe(chars.length);
});
