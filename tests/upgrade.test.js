import { test, expect } from 'vitest';
import { parseData, resultFormat } from '../assets/js/data-model.js';
import { createTypingEngine } from '../assets/js/typing-engine.js';
import { targetsFromText } from '../assets/js/lessons.js';
import { setup, result } from './helpers.js';

test('schema 2 migrates keyboard settings without changing courses or deleting history', () => {
  const original = setup();
  original.profiles.createProfile('Anna', { languageLayout:'cs-cz', keyboardModel:'dell-xps-2018' });
  original.profiles.recordResult(result());
  const data = original.storage.read(); data.schemaVersion = 2;
  delete data.profiles[0].keyboardLocale; delete data.profiles[0].keyboardPlatform;
  const upgraded = parseData(JSON.stringify(data));
  expect(upgraded.schemaVersion).toBe(3);
  expect(upgraded.profiles[0]).toMatchObject({ languageLayout:'cs-cz', keyboardLocale:'cs-cz', keyboardPlatform:'windows' });
  expect(upgraded.profiles[0].history).toHaveLength(1);
  expect(upgraded.profiles[0].courses['en-gb'].lessons['home-left'].completedAttempts).toBe(1);
});

test('text course and physical/system keyboard settings persist independently', () => {
  const { profiles, storage } = setup();
  profiles.createProfile('Boris');
  profiles.updateActiveProfileSettings({ languageLayout:'en-gb', keyboardLocale:'es-es', keyboardPlatform:'windows', keyboardModel:'macbook-air' });
  const p = parseData(JSON.stringify(storage.read())).profiles[0];
  expect(p).toMatchObject({ languageLayout:'en-gb', keyboardLocale:'es-es', keyboardPlatform:'windows', keyboardModel:'macbook-air' });
});

test('long exercises have their own best result and preserve the old format record', () => {
  const { profiles } = setup(); profiles.createProfile('Čas');
  const old = result(1, { durationMs:100 }); profiles.recordResult(old);
  const longer = result(2, { difficulty:4, exerciseVersion:2, sentenceCount:4, textIds:['a','b','c','d'],textId:'a', durationMs:50000 });
  profiles.recordResult(longer);
  let summary = profiles.getActiveProfile().courses['en-gb'].lessons['home-left'];
  expect(summary.bestResult.id).toBe(longer.id);
  expect(summary.bestByFormat[resultFormat(old)].id).toBe(old.id);
  expect(summary.bestByFormat[resultFormat(longer)].id).toBe(longer.id);
  // Larger texts use time per character, not an unfair raw-duration comparison.
  profiles.recordResult(result(3, { ...longer, id:'r-3', attempts:10, errors:2,length:8,accuracy:80,durationMs:60000 }));
  summary = profiles.getActiveProfile().courses['en-gb'].lessons['home-left'];
  expect(summary.bestResult.id).toBe('r-3');
});

test('remapping keyboard targets preserves a running exercise and its counters', () => {
  const e = createTypingEngine([{ id:'home-left',name:'',phase:'',description:'',text:'az',targets:targetsFromText('az',{}) }]);
  e.handleText('a');
  const before = e.snapshot();
  const after = e.remapTargets(targetsFromText('az',{z:{code:'KeyY'}}));
  expect(after).toMatchObject({currentIndex:1,attempts:1,runId:before.runId,currentTarget:{code:'KeyY'}});
  expect(() => e.remapTargets(targetsFromText('ax',{}))).toThrow();
});

test('new result metadata rejects truncated or contradictory sentence identities', () => {
  const { profiles }=setup(); profiles.createProfile('Validácia');
  expect(() => profiles.recordResult(result(1,{exerciseVersion:2,difficulty:4,sentenceCount:4,textId:'a',textIds:['a']}))).toThrow();
  expect(() => profiles.recordResult(result(1,{exerciseVersion:2,difficulty:2,sentenceCount:2,textId:'a',textIds:['a','a']}))).toThrow();
});
