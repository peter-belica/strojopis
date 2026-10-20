import { test, expect } from '@playwright/test';
const key = 'strojopis_data';
const pageErrors = new WeakMap();
test.beforeEach(({page})=>{ const errors=[]; pageErrors.set(page,errors); page.on('pageerror',e=>errors.push(e.message)); });
test.afterEach(({page})=>{ expect(pageErrors.get(page)).toEqual([]); });
async function ready(page) {
  await page.goto('/');
  await expect(page.locator('#lessonSelect option')).toHaveCount(17);
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  await openSettings(page);
}
async function openSettings(page) {
  for (const selector of ['.supplemental-settings','.guidance-settings']) {
    if (await page.locator(selector).getAttribute('open') === null) await page.locator(`${selector} summary`).click();
  }
}
async function createProfile(page, name) {
  if (await page.locator('.profile-settings').getAttribute('open') === null) await page.locator('.profile-settings summary').click();
  await page.locator('#profileName').fill(name);
  await page.getByRole('button',{name:'Vytvoriť profil'}).click();
  await expect(page.locator('#activeProfileChip')).toContainText(name);
  await expect(page.locator('#lessonSelect option')).toHaveCount(17);
}
async function text(page) { return (await page.locator('.typing-token').allTextContents()).map(c=>c==='␣'?' ':c).join(''); }
async function typeText(page, value) {
  await page.locator('#trainingInput').focus();
  for (const char of value) {
    if (/[a-zA-Z0-9 .,;!?]/.test(char)) await page.keyboard.type(char);
    else await page.keyboard.insertText(char);
  }
}
async function complete(page) { await typeText(page,await text(page)); await expect(page.locator('#resultPanel')).toBeVisible(); }
async function difficulty(page, value) {
  await page.locator('#difficulty').focus();
  await page.keyboard.press('Home');
  for(let i=1;i<value;i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('#difficulty')).toHaveValue(String(value));
  await expect(page.locator('#difficultyName')).toContainText(`${value} / 4`);
}
function splitSentenceBatch(value, catalog) {
  const selected = [];
  let remaining = value;
  while (remaining) {
    const sentence = catalog.find(s=>remaining === s.text || remaining.startsWith(`${s.text} `));
    expect(sentence,`Unknown sentence prefix: ${remaining.slice(0,70)}`).toBeTruthy();
    selected.push(sentence);
    remaining = remaining.slice(sentence.text.length);
    if (remaining) { expect(remaining[0]).toBe(' '); remaining = remaining.slice(1); }
  }
  return selected;
}
async function confirmDelete(page, button) {
  await page.locator(button).click();
  await expect(page.locator('#deleteDialog')).toBeVisible();
  await page.locator('#confirmDeleteButton').click();
}

test('two profiles retain distinct settings and course progress after reopening', async ({page,context}) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await ready(page);
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  await page.locator('#rememberButton').click();
  await createProfile(page,'Anna');
  const anna = await page.locator('#profileSelect').inputValue();
  await page.locator('#keyboardModel').selectOption('dell-xps-2018');
  await difficulty(page,3);
  await page.locator('#guideToggle').click();
  await page.locator('#lessonSelect').selectOption('home-right');
  await complete(page);
  await page.keyboard.type('j');
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).profiles[0].history.length,key)).toBe(1);
  await page.locator('#languageLayout').selectOption('cs-cz');
  await page.locator('#lessonSelect').selectOption('top-left');
  await page.locator('#languageLayout').selectOption('en-gb');
  await expect(page.locator('#lessonSelect')).toHaveValue('home-right');
  await createProfile(page,'Boris');
  const boris = await page.locator('#profileSelect').inputValue();
  await page.locator('#keyboardModel').selectOption('macbook-air');
  await difficulty(page,1);
  await page.locator('#guideToggle').click();
  await page.locator('#languageLayout').selectOption('cs-cz');
  await page.locator('#lessonSelect').selectOption('home-row');
  await page.reload();
  await expect(page.locator('#activeProfileChip')).toContainText('Boris');
  await expect(page.locator('#lessonSelect')).toHaveValue('home-row');
  await expect(page.locator('#languageLayout')).toHaveValue('cs-cz');
  await page.locator('.profile-settings summary').click();
  await page.locator('#profileSelect').selectOption(anna);
  await expect(page.locator('#lessonSelect')).toHaveValue('home-right');
  await expect(page.locator('#keyboardModel')).toHaveValue('dell-xps-2018');
  await expect(page.locator('#difficulty')).toHaveValue('3');
  await expect(page.locator('#guideToggle')).toHaveAttribute('aria-checked','false');
  await expect(page.locator('#profileProgress')).toContainText('1 dokončených pokusov');
  await page.locator('#languageLayout').selectOption('cs-cz');
  await expect(page.locator('#lessonSelect')).toHaveValue('top-left');
  await page.locator('#profileSelect').selectOption(boris);
  await expect(page.locator('#profileProgress')).toContainText('0 dokončených pokusov');
  await expect(page.locator('#guideToggle')).toHaveAttribute('aria-checked','true');
  expect(await context.cookies()).toEqual([]); expect(errors).toEqual([]);
});

test('all difficulty levels work in free practice and changing the slider preserves an active text', async ({page}) => {
  await ready(page); await createProfile(page,'Texty');
  for(const language of ['en-gb','cs-cz']) {
    await page.locator('#languageLayout').selectOption(language);
    await page.locator('#lessonSelect').selectOption('free-practice');
    for(let level=1;level<=4;level++) {
      const before = await text(page);
      await difficulty(page,level);
      expect(await text(page)).toBe(before);
      await page.locator('#resetButton').click();
      const after = await text(page);
      await expect(page.locator('#difficultyName')).toContainText(`${level} / 4`);
      const words = after.trim().split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(level * [3,6,10,12][level-1]);
      expect(words).toBeLessThanOrEqual(level * [7,12,20,30][level-1]);
      await expect(page.locator('#sentencePosition')).toHaveText(`Veta 1 zo ${level}`);
      const catalog = await page.evaluate(async language=>(await fetch(`content/sentences/${language}.json`)).json(),language);
      const sentences = splitSentenceBatch(after,catalog.filter(s=>s.difficulty === level));
      expect(sentences).toHaveLength(level);
      expect(new Set(sentences.map(s=>s.id)).size).toBe(level);
      expect(sentences.map(s=>s.text).join(' ')).toBe(after);
      await page.locator('#trainingInput').focus();
      await page.keyboard.insertText(after[0]);
      const inProgress = await text(page);
      await difficulty(page,level === 4 ? 1 : level + 1);
      expect(await text(page)).toBe(inProgress);
      await expect(page.locator('#exercisePosition')).toContainText('2 /');
      await difficulty(page,level);
    }
  }
});

test('incorrect input, ignored shortcut keys, synthetic composition order and form focus are isolated', async ({page}) => {
  await ready(page);
  await page.locator('#trainingInput').focus();
  await page.keyboard.press('Shift'); await page.keyboard.press('Control');
  await page.keyboard.press('Control+r');
  await expect(page.locator('#statErrors')).toHaveText('0');
  await page.keyboard.type('x');
  await expect(page.locator('#exercisePosition')).toContainText('1 /');
  await expect(page.locator('#statErrors')).toHaveText('1');
  await page.keyboard.type('a');
  await expect(page.locator('#exercisePosition')).toContainText('2 /');
  await page.locator('.profile-settings summary').click();
  await page.locator('#profileName').fill('asdf');
  await expect(page.locator('#exercisePosition')).toContainText('2 /');
  await difficulty(page,2);
  await expect(page.locator('#exercisePosition')).toContainText('2 /');
  await page.locator('#languageLayout').selectOption('cs-cz');
  await page.locator('#lessonSelect').selectOption('vowels-diacritics');
  await page.locator('#trainingInput').focus();
  await page.keyboard.type('m');
  // Simulates IME/dead-key event order. This does not prove every physical OS layout.
  await page.locator('#trainingInput').evaluate(el=> {
    el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:''}));
    el.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Dead',isComposing:true}));
    el.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'a',isComposing:true}));
    el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'a\u0301'}));
    el.dispatchEvent(new InputEvent('input',{bubbles:true,data:'á',inputType:'insertFromComposition'}));
  });
  await expect(page.locator('#exercisePosition')).toContainText('3 /');
  await expect(page.locator('#statErrors')).toHaveText('0');
});

test('cookies migrate only after remembering and fresh profiles never create cookies', async ({context,page}) => {
  const profile={id:'old',name:'Stará Anna',keyboardModel:'dell-xps-2018',languageLayout:'cs-cz'};
  const values={strojopis_profiles_index:['old'],strojopis_active_profile_id:'old',strojopis_profile_old:profile,strojopis_finger_guide:false};
  await context.addCookies(Object.entries(values).map(([name,value])=>({name,value:encodeURIComponent(JSON.stringify(value)),url:'http://127.0.0.1:4174',sameSite:'Strict'})));
  await ready(page);
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  expect((await context.cookies()).length).toBe(4);
  await page.locator('#rememberButton').click();
  await expect(page.locator('#activeProfileChip')).toContainText('Stará Anna');
  await expect(page.locator('#languageLayout')).toHaveValue('cs-cz');
  await expect(page.locator('#guideToggle')).toHaveAttribute('aria-checked','false');
  expect(await context.cookies()).toEqual([]);
  await page.reload(); await expect(page.locator('#activeProfileChip')).toContainText('Stará Anna');
});

test('failed migration preserves cookies and training continues in memory', async ({page,context}) => {
  await context.addCookies([{name:'strojopis_active_profile',value:encodeURIComponent(JSON.stringify({name:'Legacy'})),url:'http://127.0.0.1:4174'}]);
  await page.addInitScript(()=>{ Storage.prototype.setItem=()=>{throw new DOMException('full','QuotaExceededError');}; });
  await ready(page); await page.locator('#rememberButton').click();
  await expect(page.locator('#storageStatus')).toContainText('Zápis sa nepodaril');
  expect((await context.cookies()).length).toBe(1);
  await createProfile(page,'Dočasný'); await complete(page);
  await expect(page.locator('#resultProgress')).toContainText('pamäti');
});

test('unavailable storage keeps training usable in memory', async ({page}) => {
  await page.addInitScript(()=>{ Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}}); });
  await ready(page); await expect(page.locator('#storageStatus')).toContainText('nedajú bezpečne načítať');
  await createProfile(page,'Pamäť'); await complete(page);
  await page.reload(); await expect(page.locator('#activeProfileChip')).toContainText('Bez profilu');
});

test('deletion requires confirmation and keeps foreign storage keys', async ({page}) => {
  await ready(page); await page.locator('#rememberButton').click();
  await createProfile(page,'Anna'); await createProfile(page,'Boris');
  await page.evaluate(()=>localStorage.setItem('other_app','keep'));
  await page.locator('#deleteProfileButton').click(); await page.locator('#cancelDeleteButton').click();
  await expect(page.locator('#activeProfileChip')).toContainText('Boris');
  await confirmDelete(page,'#deleteProfileButton');
  await expect(page.locator('#activeProfileChip')).toContainText('Anna');
  await page.locator('.privacy summary').click(); await confirmDelete(page,'#deleteAllButton');
  await expect(page.locator('#activeProfileChip')).toContainText('Bez profilu');
  expect(await page.evaluate(()=>localStorage.getItem('other_app'))).toBe('keep');
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
});

test('static production assets need no external network and layout remains usable', async ({page,context},testInfo) => {
  const external=[], errors=[], statuses=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error') errors.push(msg.text());});
  page.on('response',r=>{if(r.status()>=400) statuses.push(`${r.status()} ${r.url()}`);});
  await context.route('**/*',route=>{
    if(new URL(route.request().url()).hostname !== '127.0.0.1') {external.push(route.request().url());return route.abort();}
    return route.continue();
  });
  await ready(page);
  for (const width of [390,768,1366]) {
    await page.setViewportSize({width,height:1000});
    await expect(page.locator('#trainingInput')).toBeVisible();
    const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,width:innerWidth}));
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.width);
    await expect(page.locator('#guideToggle')).toBeVisible();
    await page.screenshot({path:`test-results/${testInfo.project.name}-${width}.png`,fullPage:true});
  }
  await page.locator('#languageLayout').selectOption('cs-cz');
  await page.locator('#lessonSelect').selectOption('free-practice');
  await complete(page);
  expect(external).toEqual([]); expect(errors).toEqual([]); expect(statuses).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test('unknown and corrupted versions remain unchanged while a new session can train', async ({page})=>{
  for(const raw of ['{broken',JSON.stringify({schemaVersion:99,other:'future'})]) {
    await page.goto('/');
    await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key,raw});
    await page.reload();
    await expect(page.locator('#lessonSelect option')).toHaveCount(17);
    await expect(page.locator('#rememberButton')).toBeDisabled();
    await createProfile(page,'Dočasný profil'); await complete(page);
    expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(raw);
  }
});

test('completed result offers continuation and repeating without phantom completions', async ({page,context})=>{
  await ready(page); await page.locator('#rememberButton').click(); await createProfile(page,'Postup');
  await complete(page);
  await expect(page.locator('#resultProgress')).toContainText('1 dokončených pokusov');
  await page.locator('#nextButton').click();
  await expect(page.locator('#lessonSelect')).toHaveValue('home-right');
  await expect(page.locator('#resultPanel')).toBeHidden();
  await complete(page); await page.locator('#repeatButton').click();
  await expect(page.locator('#lessonSelect')).toHaveValue('home-right');
  const reopened=await context.newPage(); await ready(reopened);
  await expect(reopened.locator('#activeProfileChip')).toContainText('Postup');
  await expect(reopened.locator('#lessonSelect')).toHaveValue('home-right');
  await reopened.locator('.profile-settings summary').click();
  await expect(reopened.locator('#profileProgress')).toContainText('2 dokončených pokusov');
  await reopened.close();
});

test('main controls can be operated with keyboard and respect reduced motion',async ({page},testInfo)=>{
  // WebKit on macOS follows the system's Option+Tab navigation preference.
  const tabKey = process.platform === 'darwin' && testInfo.project.name === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.emulateMedia({reducedMotion:'reduce'});
  await ready(page);
  // Settings disclosure summaries take part in the native tab order. Locate each
  // control by bounded traversal so adding another accessible control is harmless.
  const focusWithTab = async (selector, reverse=false) => {
    for (let i=0;i<45;i++) {
      if (await page.locator(selector).evaluate(el=>el === document.activeElement)) return;
      await page.keyboard.press(reverse ? (tabKey === 'Alt+Tab' ? 'Alt+Shift+Tab' : 'Shift+Tab') : tabKey);
    }
    await expect(page.locator(selector)).toBeFocused();
  };
  await page.locator('a.brand').focus();
  await expect(page.locator('a.brand')).toBeFocused();
  await focusWithTab('#resetButton');
  await focusWithTab('#languageLayout');
  await focusWithTab('#lessonSelect');
  // Native select type-ahead works in both headless tests and system menus.
  await page.keyboard.press('v');
  await expect(page.locator('#lessonSelect')).toHaveValue('free-practice');
  await focusWithTab('#difficulty');
  await page.keyboard.press('End'); await expect(page.locator('#difficulty')).toHaveValue('4');
  expect(await page.locator('#difficulty').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  await focusWithTab('#keyboardLocale');
  await focusWithTab('#keyboardPlatform');
  await focusWithTab('#keyboardModel');
  await focusWithTab('#guideToggle');
  await focusWithTab('.profile-settings summary');
  await page.keyboard.press('Enter');
  await focusWithTab('#profileName'); await page.keyboard.type('Klavesnica');
  await focusWithTab('#profileForm button'); await page.keyboard.press('Enter');
  await expect(page.locator('#activeProfileChip')).toContainText('Klavesnica');
  // Creating a profile returns focus to the final training input. The memory
  // button is earlier in DOM order; reverse traversal avoids browser chrome.
  await focusWithTab('#rememberButton',true);
  const animation = await page.locator('.overlay-contact').first().evaluate(el=>getComputedStyle(el).animationName);
  expect(animation).toBe('none');
});

test('practice surface contains only the text row and keyboard while information stays in the sidebar',async ({page})=>{
  await ready(page);
  await expect(page.locator('.practice-panel > *')).toHaveCount(2);
  await expect(page.locator('.practice-panel > :first-child')).toHaveClass('exercise-card');
  await expect(page.locator('.practice-panel > :last-child')).toHaveClass('keyboard-stage');
  for (const id of ['practiceTitle','exercisePosition','sentencePosition','exerciseProgress','feedbackLine','statAccuracy','statErrors','resultPanel','languageLayout','lessonSelect','difficulty','keyboardModel','keyboardLocale','keyboardPlatform','guideToggle','fingerInstruction','profileForm']) {
    await expect(page.locator(`.side-panel #${id}`)).toHaveCount(1);
  }
  const row=await page.locator('.exercise-card').boundingBox();
  const keyboard=await page.locator('.keyboard-stage').boundingBox();
  expect(keyboard.y).toBeGreaterThan(row.y + row.height);
  expect(keyboard.y - row.y - row.height).toBeLessThanOrEqual(33);
  await expect(page.locator('#trainingInput')).toHaveAttribute('aria-label',/Píš zvýraznené znaky/);
});

test('keyboard language, system and hardware preserve active course text, position and errors',async ({page})=>{
  await ready(page); await page.locator('#rememberButton').click(); await createProfile(page,'Rozloženia');
  const original=await text(page);
  await page.locator('#trainingInput').focus();
  await page.keyboard.insertText('x');
  await page.keyboard.insertText(original[0]);
  const position=await page.locator('#exercisePosition').textContent();
  const errors=await page.locator('#statErrors').textContent();
  expect(errors).toBe('1');
  for (const locale of ['cs-cz','es-es','en-us','en-gb','sk-sk']) {
    await page.locator('#keyboardLocale').selectOption(locale);
    await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
    expect(await text(page)).toBe(original);
    await expect(page.locator('#exercisePosition')).toHaveText(position);
    await expect(page.locator('#statErrors')).toHaveText(errors);
    await expect(page.locator('#languageLayout')).toHaveValue('en-gb');
    for (const platform of ['windows','mac']) {
      await page.locator('#keyboardPlatform').selectOption(platform);
      await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
      expect(await text(page)).toBe(original);
      await expect(page.locator('#exercisePosition')).toHaveText(position);
      await expect(page.locator('#statErrors')).toHaveText(errors);
      await expect(page.locator('#keyboardLocale')).toHaveValue(locale);
    }
  }
  await page.locator('#keyboardModel').selectOption('dell-xps-2018');
  expect(await text(page)).toBe(original);
  await expect(page.locator('#exercisePosition')).toHaveText(position);
  await expect(page.locator('#statErrors')).toHaveText(errors);
  await page.locator('#keyboardLocale').selectOption('es-es');
  await page.locator('#keyboardPlatform').selectOption('windows');
  await page.locator('#languageLayout').selectOption('cs-cz');
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#keyboardLocale')).toHaveValue('es-es');
  await expect(page.locator('#keyboardPlatform')).toHaveValue('windows');
  await page.reload(); await openSettings(page);
  await expect(page.locator('#keyboardLocale')).toHaveValue('es-es');
  await expect(page.locator('#keyboardPlatform')).toHaveValue('windows');
  await expect(page.locator('#keyboardModel')).toHaveValue('dell-xps-2018');
  await expect(page.locator('#languageLayout')).toHaveValue('cs-cz');
});

test('level four records a result only after all four complete sentences',async ({page})=>{
  await ready(page); await page.locator('#rememberButton').click(); await createProfile(page,'Štyri vety');
  await page.locator('#lessonSelect').selectOption('free-practice');
  await difficulty(page,4); await page.locator('#resetButton').click();
  const value=await text(page);
  const catalog=await page.evaluate(async ()=>(await fetch('content/sentences/en-gb.json')).json());
  const sentences=splitSentenceBatch(value,catalog.filter(s=>s.difficulty === 4));
  expect(sentences).toHaveLength(4);
  await page.locator('#trainingInput').focus();
  // Native text insertion exercises input handling; it does not emulate OS layouts.
  for (let index=0;index<sentences.length;index++) {
    if (index) await page.keyboard.insertText(' ');
    await page.keyboard.insertText(sentences[index].text);
    if (index < sentences.length - 1) {
      await expect(page.locator('#resultPanel')).toBeHidden();
      await expect(page.locator('#sentencePosition')).toHaveText(`Veta ${index + 2} zo 4`);
      expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).profiles[0].history.length,key)).toBe(0);
    }
  }
  await expect(page.locator('#resultPanel')).toBeVisible();
  await expect(page.locator('.typing-token.is-done')).toHaveCount(Array.from(value).length);
  await expect(page.locator('#sentencePosition')).toHaveText('Veta 4 zo 4');
  await expect(page.locator('#resultMetrics')).toContainText('4 vety');
  const history=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).profiles[0].history,key);
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({difficulty:4,sentenceCount:4,exerciseVersion:2,length:Array.from(value).length,errors:0});
  expect(history[0].textIds).toEqual(sentences.map(s=>s.id));
});
