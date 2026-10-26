import { test, expect } from '@playwright/test';

async function ready(page) {
  await page.goto('/');
  await expect(page.locator('.practice-panel')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#lessonSelect option')).toHaveCount(17);
}
const exerciseText = async page => (await page.locator('.typing-token').allTextContents()).map(char => char === '␣' ? ' ' : char).join('');

test('the live speedometer and runner follow typing, stop on idle, and preserve the final average', async ({page}, testInfo) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await ready(page);
  await expect(page.locator('#speedValue')).toHaveText('0');
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-pace','idle');
  const text = await exerciseText(page);
  await page.locator('#trainingInput').focus();
  await page.keyboard.type(text.slice(0,28),{delay:50});
  await expect.poll(async()=>Number(await page.locator('#speedValue').textContent())).toBeGreaterThan(0);
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-moving','true');
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-pace','sprint');
  expect(await page.locator('.runner-leg-front').evaluate(el=>getComputedStyle(el).animationName)).toBe('runner-stride');
  await page.setViewportSize({width:1366,height:1000});
  await page.locator('#speedPanel').screenshot({path:testInfo.outputPath('speedometer-sprint.png')});
  // The interval also updates with no input: the avatar must not run forever.
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-moving','false');
  await expect(page.locator('#speedValue')).toHaveText('0');
  const remaining = text.slice(28);
  await page.locator('#trainingInput').focus();
  await page.keyboard.insertText(remaining);
  await expect(page.locator('#resultPanel')).toBeVisible();
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-pace','complete');
  const finalSpeed = await page.locator('#speedValue').textContent();
  expect(Number(finalSpeed)).toBeGreaterThan(0);
  await expect(page.locator('#speedAverage')).toHaveText(`${finalSpeed} znakov/min`);
  await expect(page.locator('#resultMetrics')).toContainText(`${finalSpeed} správnych znakov/min`);
  await page.locator('#resetButton').click();
  await expect(page.locator('#speedValue')).toHaveText('0');
  await expect(page.locator('#speedAverage')).toHaveText('0 znakov/min');
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-pace','idle');
  expect(errors).toEqual([]);
});

test('pausing freezes the average and reduced-motion users get the same speed without animation', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await ready(page);
  const text = await exerciseText(page);
  await page.locator('#trainingInput').focus();
  await page.keyboard.type(text.slice(0,28),{delay:50});
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-moving','true');
  for (const selector of ['.runner-leg-front','.runner-bounce','.runner-trail']) {
    expect(await page.locator(selector).evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  }
  await page.locator('#languageLayout').focus();
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-pace','paused');
  const average = await page.locator('#speedAverage').textContent();
  await expect(page.locator('#speedValue')).toHaveText('0');
  await page.locator('#lessonSelect').focus();
  await expect(page.locator('#speedAverage')).toHaveText(average);
  await page.locator('#lessonSelect').selectOption('home-right');
  await expect(page.locator('#speedAverage')).toHaveText('0 znakov/min');
  await expect(page.locator('#speedPanel')).toHaveAttribute('data-pace','idle');
});
