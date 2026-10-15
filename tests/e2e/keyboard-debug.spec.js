import { test,expect } from '@playwright/test';
test('native select diagnostic',async ({page})=>{
 await page.goto('/'); await expect(page.locator('#lessonSelect option')).toHaveCount(17);
 await page.locator('#lessonSelect').focus();
 await page.evaluate(()=>{window.debugEvents=[];for(const type of ['keydown','keyup','input','change','blur','focus'])window.addEventListener(type,e=>window.debugEvents.push({type,key:e.key,id:e.target.id,value:e.target.value,prevented:e.defaultPrevented,active:document.activeElement.id}));});
 for(const key of ['ArrowDown','ArrowDown','Enter','End','v','Tab']) {await page.keyboard.press(key);console.log(key,await page.locator('#lessonSelect').inputValue());}
 console.log(await page.evaluate(()=>window.debugEvents));
});
