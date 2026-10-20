import { test, expect } from '@playwright/test';

async function ready(page,drill) {
  if (drill) {
    // Keep the real production application and full course catalogue. A tiny
    // first-lesson fixture makes the next physical target deterministic.
    await page.route('**/content/courses/en-gb.json',async route=>{
      const response=await route.fetch();
      const course=await response.json();
      course.lessons[0]={...course.lessons[0],introducedCharacters:[...new Set(Array.from(drill))],blocks:[{type:'drill',text:drill}]};
      await route.fulfill({response,json:course});
    });
  }
  await page.goto('/');
  await expect(page.locator('#lessonSelect option')).toHaveCount(17);
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  await page.locator('.supplemental-settings summary').click();
  await expect(page.locator('.overlay-contact')).toHaveCount(10);
}

async function contactDistance(page,finger,code) {
  return page.evaluate(({finger,code})=>{
    const contact=document.querySelector(`[data-tip="${finger}"]`);
    const point=new DOMPoint(Number(contact.getAttribute('cx')),Number(contact.getAttribute('cy'))).matrixTransform(contact.getScreenCTM());
    const key=document.querySelector(`.key[data-code="${code}"]`).getBoundingClientRect();
    const letter=document.querySelector('.key[data-code="KeyA"]').getBoundingClientRect();
    // Wide caps accept a natural near-edge contact; a thumb need not reach the
    // exact centre of the spacebar. Standard letter contacts remain exact.
    if(key.width>letter.width*1.3) return Math.hypot(Math.max(key.x-point.x,0,point.x-key.right),Math.max(key.y-point.y,0,point.y-key.bottom));
    return Math.hypot(point.x-key.x-key.width/2,point.y-key.y-key.height/2);
  },{finger,code});
}
async function accept(page,char) {
  await page.locator('#trainingInput').focus();
  // Browser input exercises the compiled application; it is not an OS layout test.
  await page.keyboard.insertText(char);
}

const errors=new WeakMap();
test.beforeEach(({page})=>{ const messages=[]; errors.set(page,messages); page.on('pageerror',e=>messages.push(e.message)); });
test.afterEach(({page})=>{ expect(errors.get(page)).toEqual([]); });

test('MacBook ISO keyboard includes all outer keys and a tall shaped Enter',async ({page})=>{
  await ready(page);
  for (const code of ['Escape','Backspace','Enter','Backquote','IntlBackslash','Backslash','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ShiftLeft','ShiftRight','AltLeft','AltRight','MetaLeft','MetaRight']) {
    await expect(page.locator(`.key[data-code="${code}"]`)).toHaveCount(1);
  }
  const enter=await page.locator('.key[data-code="Enter"]').boundingBox();
  const letter=await page.locator('.key[data-code="KeyA"]').boundingBox();
  expect(enter.height).toBeGreaterThan(letter.height*1.8);
  expect(await page.locator('.key[data-code="Enter"]').evaluate(el=>getComputedStyle(el).clipPath)).toContain('polygon');
  const codes=await page.locator('.key').evaluateAll(keys=>keys.map(key=>key.dataset.code));
  expect(new Set(codes).size).toBe(codes.length);
  const board=await page.locator('#keyboardPreview').boundingBox();
  for(const key of await page.locator('.key').all()) {
    const box=await key.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(board.x-.5);
    expect(box.y).toBeGreaterThanOrEqual(board.y-.5);
    expect(box.x+box.width).toBeLessThanOrEqual(board.x+board.width+.5);
    expect(box.y+box.height).toBeLessThanOrEqual(board.y+board.height+.5);
  }
});

test('real target changes move fingertips onto keys across rows and sizes',async ({page})=>{
  await ready(page,'1rgbu. a');
  await page.locator('#keyboardLocale').selectOption('en-us');
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  for(const width of [390,1366]) {
    await page.setViewportSize({width,height:1000});
    await page.locator('#resetButton').click();
    for (const [char,code,finger] of [['1','Digit1','left-pinky'],['r','KeyR','left-index'],['g','KeyG','left-index'],['b','KeyB','left-index'],['u','KeyU','right-index'],['.','Period','right-ring'],[' ','Space','right-thumb']]) {
      await expect(page.locator('.key.is-active')).toHaveAttribute('data-code',code);
      await expect.poll(()=>contactDistance(page,finger,code),{message:`${width}px ${finger} reaches ${code}`}).toBeLessThan(1.5);
      await accept(page,char);
    }
  }
});

test('neutral hands remain on home keys and the overlay shares the keyboard plane',async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  // The default Slovak mapping has no Ω recipe. Unknown input keeps every finger home.
  await ready(page,'Ωa');
  await expect(page.locator('.key.is-active')).toHaveCount(0);
  for (const [code,finger] of [['KeyA','left-pinky'],['KeyS','left-ring'],['KeyD','left-middle'],['KeyF','left-index'],['KeyJ','right-index'],['KeyK','right-middle'],['KeyL','right-ring'],['Semicolon','right-pinky']]) {
    expect(await contactDistance(page,finger,code)).toBeLessThan(1.5);
  }
  await expect(page.locator('.overlay-finger.is-active')).toHaveCount(0);
  const board=await page.locator('#keyboardPreview').boundingBox();
  const overlay=await page.locator('.hand-overlay').boundingBox();
  expect(overlay.x).toBeCloseTo(board.x,1); expect(overlay.y).toBeCloseTo(board.y,1);
  expect(overlay.width).toBeCloseTo(board.width,1); expect(overlay.height).toBeCloseTo(board.height,1);
  const stacking=await page.locator('#handGuide').evaluate(el=>({z:Number(getComputedStyle(el).zIndex),pointerEvents:getComputedStyle(el).pointerEvents}));
  expect(stacking.z).toBeGreaterThan(0); expect(stacking.pointerEvents).toBe('none');
  expect(await page.locator('.overlay-contact').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

test('real Shift and Option targets display simultaneous contacts with separate fingers',async ({page})=>{
  await ready(page,'RΩ€a');
  await page.locator('#keyboardLocale').selectOption('en-us');
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  for (const [char,required] of [['R',['KeyR','ShiftRight']],['Ω',['KeyZ','AltRight']],['€',['Digit2','ShiftRight','AltRight']]]) {
    await expect(page.locator('.typing-token.is-current')).toHaveText(char);
    await expect(page.locator('.overlay-finger.is-active')).toHaveCount(required.length);
    const fingers=await page.locator('.overlay-finger.is-active').evaluateAll(groups=>groups.map(group=>group.dataset.handFinger));
    expect(new Set(fingers).size).toBe(required.length);
    for (const code of required) {
      const active=page.locator(`.overlay-finger.is-active[data-key-code="${code}"]`);
      await expect(active).toHaveCount(1);
      const finger=await active.getAttribute('data-hand-finger');
      await expect.poll(()=>contactDistance(page,finger,code)).toBeLessThan(1.5);
    }
    await accept(page,char);
  }
});

test('browser modifier key events highlight the selected chord and advance once',async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await ready(page,'La');
  await page.locator('#keyboardLocale').selectOption('en-us');
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('.typing-token.is-current')).toHaveText('L');
  await expect(page.locator('.key.is-active')).toHaveAttribute('data-code','KeyL');
  await expect(page.locator('.key.is-modifier')).toHaveAttribute('data-code','ShiftLeft');
  await expect(page.locator('.overlay-finger.is-active')).toHaveCount(2);
  expect(await contactDistance(page,'right-ring','KeyL')).toBeLessThan(1.5);
  expect(await contactDistance(page,'left-pinky','ShiftLeft')).toBeLessThan(1.5);
  await page.locator('#trainingInput').focus();
  await page.keyboard.down('Shift');
  await expect(page.locator('.key[data-code="ShiftLeft"]')).toHaveClass(/is-pressed/);
  await expect(page.locator('#exercisePosition')).toContainText('1 /');
  // A physical key code lets the held Shift determine the character. A literal
  // lowercase 'l' asks Playwright for lowercase text even while Shift is held.
  await page.keyboard.press('KeyL'); await page.keyboard.up('Shift');
  await expect(page.locator('#exercisePosition')).toContainText('2 /');
  await expect(page.locator('#statErrors')).toHaveText('0');
  await expect(page.locator('.key.is-pressed')).toHaveCount(0);
});
