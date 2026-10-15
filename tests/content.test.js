import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { selectSentence, validateSentences } from '../assets/js/sentences.js';
import { normalizeCourse, prepareExercise, targetsFromText, validateCourse } from '../assets/js/lessons.js';
const read = path => JSON.parse(readFileSync(new URL(`../content/${path}`, import.meta.url),'utf8'));
const corpus = ['cs-cz','en-gb'].flatMap(l => read(`sentences/${l}.json`));
test('240 sentences satisfy counts, language, identifiers, word ranges and uniqueness', () => {
  expect(corpus).toHaveLength(240); expect(validateSentences(corpus)).toEqual([]);
});
test('validator reports corrupt metadata, duplicate text and IDs', () => {
  const copy = structuredClone(corpus); copy[1] = {...copy[0]}; copy[2].language = 'bad'; copy[3].text = ''; copy[4].difficulty = 99;
  const errors = validateSentences(copy).join(' ');
  expect(errors).toContain('duplicitné id'); expect(errors).toContain('Duplicitná veta'); expect(errors).toContain('Neplatný jazyk'); expect(errors).toContain('Neplatný text');
});
test.each(['cs-cz','en-gb'])('selection respects language and all four difficulties: %s', language => {
  for (const difficulty of [1,2,3,4]) expect(selectSentence(corpus, {language,difficulty},()=>0)).toMatchObject({language,difficulty});
});
test('selection checks exact taught characters including capitals, punctuation and spaces', () => {
  const first = corpus[0]; const allowed = [...new Set(first.text)];
  expect(selectSentence([first], {language:first.language,difficulty:1,allowedCharacters:allowed})).toEqual(first);
  for (const excluded of [' ','.','M']) expect(selectSentence([first], {language:first.language,difficulty:1,allowedCharacters:allowed.filter(c=>c!==excluded)})).toBeNull();
});
test('does not immediately repeat a previous sentence when alternatives exist', () => {
  const first = selectSentence(corpus,{language:'en-gb',difficulty:2},()=>0);
  expect(selectSentence(corpus,{language:'en-gb',difficulty:2,previousId:first.id},()=>0).id).not.toBe(first.id);
  expect(selectSentence([first],{language:'en-gb',difficulty:2,previousId:first.id}).id).toBe(first.id);
});
test.each(['cs-cz','en-gb'])('progressive course never introduces untaught characters and falls back honestly: %s', language => {
  const course = read(`courses/${language}.json`), layout = read(`keyboard-layouts/${language}.json`);
  expect(validateCourse(course,layout)).toEqual([]);
  const lessons = normalizeCourse(course,layout);
  for (const base of lessons) for (const difficulty of [1,2,3,4]) {
    const exercise = prepareExercise(base,corpus,language,difficulty,layout,null);
    expect(Array.from(exercise.text).every(c => base.allowedCharacters.includes(c))).toBe(true);
    expect(exercise.targets.length).toBeGreaterThan(0);
  }
  const first = prepareExercise(lessons[0],corpus,language,1,layout,null);
  expect(first.fallback).toBe(true); expect(first.text).not.toMatch(/[A-Z.]/);
  expect(prepareExercise({...lessons[0],id:'free-practice'},corpus,language,4,layout,null).fallback).toBe(false);
});
test('missing physical mapping stays unknown', () => {
  const cs = read('keyboard-layouts/cs-cz.json');
  expect(targetsFromText('ďÁ',cs.charMap).map(t=>t.code)).toEqual(['','']);
});
