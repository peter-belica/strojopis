import { test, expect } from 'vitest';
import { createTypingEngine, charactersPerMinute } from '../assets/js/typing-engine.js';
import { targetsFromText } from '../assets/js/lessons.js';
import { getSpeedFeedback, getSpeedPace } from '../assets/js/speed-feedback.js';

const lesson = (text = 'a'.repeat(100)) => ({id:'home-left', name:'', phase:'', description:'', text, targets:targetsFromText(text,{})});

test('speed counts correct normalised characters per active minute, including spaces', () => {
  let now = 0;
  const engine = createTypingEngine([lesson('á a xyz')], () => now);
  engine.handleText('a\u0301');
  expect(engine.snapshot()).toMatchObject({currentCpm:0, averageCpm:0});
  now = 1000; engine.handleText(' ');
  expect(engine.snapshot()).toMatchObject({currentCpm:120, averageCpm:120, completed:2});
  now = 2000; engine.handleText('a');
  expect(engine.snapshot()).toMatchObject({currentCpm:90, averageCpm:90, completed:3});
});

test('incorrect keystrokes cannot inflate speed or keep a stopped runner moving', () => {
  let now = 0; const engine = createTypingEngine([lesson()], () => now);
  engine.handleText('a'); now = 1000; engine.handleText('a');
  const correct = engine.snapshot();
  engine.handleText('xxxxx');
  expect(engine.snapshot()).toMatchObject({currentCpm:correct.currentCpm, averageCpm:correct.averageCpm, completed:2, errors:5});
  now = 3000; engine.handleText('xxxx');
  expect(engine.snapshot()).toMatchObject({currentCpm:0, completed:2, errors:9});
  expect(getSpeedFeedback(engine.snapshot()).moving).toBe(false);
});

test('live speed reflects a rolling five-second window rather than the entire lesson', () => {
  let now = 0; const engine = createTypingEngine([lesson()], () => now);
  for (now = 0; now <= 10000; now += 1000) engine.handleText('a');
  now = 10000;
  expect(engine.snapshot()).toMatchObject({currentCpm:60, averageCpm:66});
  for (now = 10200; now <= 12000; now += 200) engine.handleText('a');
  now = 12000;
  expect(engine.snapshot()).toMatchObject({currentCpm:156, averageCpm:105});
});

test('pauses freeze average speed and duration; resuming starts a fresh live window', () => {
  let now = 0; const engine = createTypingEngine([lesson()], () => now);
  engine.handleText('a'); now = 1000; engine.handleText('a');
  engine.pause();
  const paused = engine.snapshot();
  now = 61000;
  expect(engine.snapshot()).toMatchObject({isPaused:true, currentCpm:0, durationMs:paused.durationMs, averageCpm:paused.averageCpm});
  expect(getSpeedFeedback(engine.snapshot()).pace).toBe('paused');
  engine.handleText('a');
  expect(engine.snapshot()).toMatchObject({currentCpm:0, isPaused:false});
  now = 62000; engine.handleText('a');
  expect(engine.snapshot()).toMatchObject({currentCpm:120, averageCpm:120, durationMs:2000});
});

test('live speed stops after two seconds without correct input and restarts without an idle-time spike', () => {
  let now = 0; const engine = createTypingEngine([lesson()], () => now);
  engine.handleText('a'); now = 1000; engine.handleText('a');
  now = 2999; expect(engine.snapshot().currentCpm).toBeGreaterThan(0);
  now = 3000; expect(engine.snapshot().currentCpm).toBe(0);
  now = 10000; engine.handleText('a');
  expect(engine.snapshot().currentCpm).toBe(0);
  now = 11000; engine.handleText('a');
  expect(engine.snapshot().currentCpm).toBe(120);
});

test('completion freezes the average and the runner celebrates; reset and lesson changes clear speed', () => {
  let now = 0; const engine = createTypingEngine([lesson('ab')], () => now);
  engine.handleText('a'); now = 2000; engine.handleText('b');
  expect(engine.snapshot()).toMatchObject({isComplete:true, averageCpm:60, currentCpm:0});
  expect(getSpeedFeedback(engine.snapshot())).toMatchObject({pace:'complete', value:60, moving:false});
  now = 90000; engine.pause();
  expect(engine.snapshot()).toMatchObject({averageCpm:60, durationMs:2000});
  engine.reset();
  expect(engine.snapshot()).toMatchObject({averageCpm:0, currentCpm:0, isPaused:false});
  engine.setLessons([lesson('xyz')]);
  expect(engine.snapshot()).toMatchObject({averageCpm:0, currentCpm:0, completed:0});
});

test('an instant character burst never produces infinity or an initial sprint', () => {
  const engine = createTypingEngine([lesson()], () => 0);
  engine.handleText('a'.repeat(20));
  expect(engine.snapshot()).toMatchObject({currentCpm:0, averageCpm:0});
  expect(charactersPerMinute(20, 0)).toBe(0);
});

test.each([[0,'idle'],[1,'stroll'],[119,'stroll'],[120,'walk'],[239,'walk'],[240,'run'],[359,'run'],[360,'sprint'],[900,'sprint']])('pace %s characters/min produces %s', (speed, pace) => {
  expect(getSpeedPace(speed)).toBe(pace);
});

test('the dial saturates at its labelled maximum while the numeric speed remains accurate', () => {
  const feedback = getSpeedFeedback({...createTypingEngine().snapshot(), currentCpm:900});
  expect(feedback).toMatchObject({value:900, fill:100, pace:'sprint'});
  expect(feedback.stepSeconds).toBeGreaterThanOrEqual(.14);
});
