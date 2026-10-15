import { test, expect } from 'vitest';
import { createTypingEngine } from '../assets/js/typing-engine.js';
import { targetsFromText } from '../assets/js/lessons.js';
import { setup, result } from './helpers.js';
const lesson = text => ({ id: 'home-left', name: '', phase: '', description: '', text, targets: targetsFromText(text, {}) });
test('incorrect input leaves the same position, correct characters advance and completion is claimed once', () => {
  let time = 100;
  const engine = createTypingEngine([lesson('as')], () => time);
  expect(engine.claimResult('en-gb')).toBeNull();
  engine.handleText('x'); time = 1100;
  expect(engine.snapshot()).toMatchObject({ currentIndex: 0, errors: 1, attempts: 1, accuracy: 0 });
  engine.handleText('a'); time = 2100; engine.handleText('s');
  expect(engine.snapshot()).toMatchObject({ isComplete: true, currentIndex: 2, attempts: 3, errors: 1, accuracy: 67, durationMs: 2000 });
  const r = engine.claimResult('en-gb'); expect(r).toMatchObject({ length: 2, attempts: 3, accuracy: 67 });
  expect(engine.claimResult('en-gb')).toBeNull();
  engine.handleText('x'); expect(engine.snapshot().attempts).toBe(3);
  engine.reset(); expect(engine.snapshot()).toMatchObject({ attempts: 0, isComplete: false });
});
test('active time starts with first input and excludes explicit pauses', () => {
  let time = 0; const e = createTypingEngine([lesson('abc')], () => time);
  time = 5000; e.handleText('a'); time = 6000; e.pause(); time = 20000;
  e.handleText('b'); time = 21000; e.handleText('c');
  expect(e.snapshot().durationMs).toBe(2000);
});
test('normalises composed characters and uses resulting characters rather than physical codes', () => {
  const e = createTypingEngine([lesson('éÁ')]);
  e.handleText('e\u0301'); e.handleKeydown({ key: 'Á', code: 'KeyA', shiftKey: false });
  expect(e.snapshot()).toMatchObject({ isComplete: true, attempts: 2, errors: 0 });
});
test('ignores dead keys, composition helper events, modifiers, repeat and shortcuts', () => {
  const e = createTypingEngine([lesson('a')]);
  for (const event of [{ key:'Dead' }, { key:'Shift' }, { key:'a', isComposing:true }, { key:'a', repeat:true }, { key:'a', metaKey:true }, { key:'r', ctrlKey:true }, { key:'a', altKey:true }]) e.handleKeydown(event);
  expect(e.snapshot().attempts).toBe(0);
});
test('empty lessons cannot complete and switching lessons resets measurements', () => {
  const e = createTypingEngine(); e.handleText('x'); expect(e.snapshot().attempts).toBe(0); expect(e.claimResult('en-gb')).toBeNull();
  e.setLessons([lesson('ab')]); e.handleText('a'); e.setLesson('home-left'); expect(e.snapshot().currentIndex).toBe(0);
});
test('profile and course progress remain isolated and best result uses accuracy then duration', () => {
  const { profiles } = setup(); const a = profiles.createProfile('A');
  profiles.selectLesson('en-gb','top-left'); profiles.selectLesson('cs-cz','home-row');
  profiles.recordResult(result()); profiles.recordResult(result());
  profiles.recordResult(result(2,{durationMs:1000}));
  profiles.recordResult(result(3,{accuracy:100,attempts:4,errors:0,durationMs:2000}));
  const course = profiles.getActiveProfile().courses['en-gb'];
  expect(course.lessons['home-left'].completedAttempts).toBe(3);
  expect(course.lessons['home-left'].bestResult.id).toBe('r-3');
  expect(course.lastLessonId).toBe('top-left');
  profiles.createProfile('B'); expect(profiles.getActiveProfile().history).toHaveLength(0);
  profiles.setActiveProfile(a.id); expect(profiles.getActiveProfile().courses['cs-cz'].lastLessonId).toBe('home-row');
});
test('only the last 100 results are retained while summaries continue to aggregate', () => {
  const { profiles } = setup(); profiles.createProfile('A');
  for (let i=1;i<=105;i++) profiles.recordResult(result(i));
  const p = profiles.getActiveProfile();
  expect(p.history).toHaveLength(100); expect(p.history[0].id).toBe('r-6'); expect(p.courses['en-gb'].lessons['home-left'].completedAttempts).toBe(105);
});
