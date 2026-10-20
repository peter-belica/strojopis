import {readFileSync} from 'node:fs';
import {test,expect,vi,afterEach} from 'vitest';
import {KEYBOARD_MODELS,getKeyboardModel,getKeyGeometry} from '../assets/js/keyboard-models.js';
import {KEYBOARD_LOCALES,KEYBOARD_PLATFORMS,loadKeyboardLayout} from '../assets/js/keyboard-layouts.js';
const read=(platform,locale)=>JSON.parse(readFileSync(new URL(`../content/keyboard-layouts/${platform}/${locale}.json`,import.meta.url),'utf8'));
const layouts=KEYBOARD_PLATFORMS.flatMap(({id:platform})=>KEYBOARD_LOCALES.flatMap(({id:locale})=>{
 const data=read(platform,locale);return [['iso',data],['ansi',data.variants.ansi]].map(([variant,layout])=>({platform,locale,variant,layout}));
}));
afterEach(()=>vi.unstubAllGlobals());
test.each(Object.values(KEYBOARD_MODELS))('$name geometry has unique bounded keys, complete rows and physical controls',model=>{
 expect(new Set(model.keys.map(k=>k.code)).size).toBe(model.keys.length);
 expect(model.rows.flat().sort()).toEqual(model.keys.map(k=>k.code).sort());
 for(const key of model.keys){expect(key.x).toBeGreaterThanOrEqual(0);expect(key.y).toBeGreaterThanOrEqual(0);expect(key.width).toBeGreaterThan(0);expect(key.height).toBeGreaterThan(0);expect(key.x+key.width).toBeLessThanOrEqual(model.width+.0001);expect(key.y+key.height).toBeLessThanOrEqual(model.height+.0001);}
 for(const code of ['Escape','F1','F12','Backquote','Backspace','Backslash','Enter','ArrowLeft','ArrowDown','ArrowUp','ArrowRight','ShiftLeft','ShiftRight'])expect(getKeyGeometry(model,code)).not.toBeNull();
 expect(getKeyGeometry(model,'IntlBackslash')!==null).toBe(model.variant==='iso');
 expect(getKeyGeometry(model,'Enter').height).toBe(model.variant==='iso'?2:1);
 expect(getKeyGeometry(model,'KeyQ').x).toBe(1.5);expect(getKeyGeometry(model,'KeyA').x).toBe(1.75);
});
test('Mac M3 ISO is default with full-height function row and visual Touch ID',()=>{
 const model=getKeyboardModel('unknown');expect(model.id).toBe('macbook-air');expect(model.keys).toHaveLength(79);expect(getKeyboardModel('macbook-air-ansi').keys).toHaveLength(78);expect(getKeyGeometry(model,'F6').height).toBe(1);expect(getKeyGeometry(model,'TouchID').label).toBe('Touch ID');
});
test.each(layouts)('$platform $locale $variant maps real geometry with explicit unambiguous strokes',({platform,variant,layout})=>{
 const model=getKeyboardModel(`${platform==='mac'?'macbook-air':'dell-xps-2018'}${variant==='ansi'?'-ansi':''}`);
 const used=new Map();
 for(const [char,map] of Object.entries(layout.charMap)){
  expect([...char]).toHaveLength(1);expect(map.steps.length).toBeGreaterThan(0);expect(map.code).toBe(map.steps[0].code);
  const signature=JSON.stringify(map.steps.map(s=>[s.code,[...(s.modifiers||[])].sort(),!!s.dead]));
  expect(used.get(signature),`same strokes assigned to ${used.get(signature)} and ${char}`).toBeUndefined();used.set(signature,char);
  for(const step of map.steps){expect(getKeyGeometry(model,step.code),`${char}: ${step.code}`).not.toBeNull();for(const code of step.modifiers||[])expect(getKeyGeometry(model,code),`${char}: ${code}`).not.toBeNull();if(platform==='windows')expect(step.modifiers||[]).not.toContain('AltLeft');}
 }
});
test('independent British expectations distinguish native Mac and Windows symbol positions',()=>{
 const mac=read('mac','en-gb').charMap,win=read('windows','en-gb').charMap;
 expect(mac['@'].steps).toEqual([{code:'Digit2',modifiers:['ShiftRight']}]);expect(mac['#'].steps).toEqual([{code:'Digit3',modifiers:['AltRight']}]);
 expect(win['@'].steps).toEqual([{code:'Quote',modifiers:['ShiftLeft']}]);expect(win['#'].steps).toEqual([{code:'Backslash'}]);expect(win['£'].steps).toEqual([{code:'Digit3',modifiers:['ShiftRight']}]);
});
test('Czech and Slovak accents are physical dead-key sequences, with per-step opposite Shift',()=>{
 for(const platform of ['mac','windows'])for(const locale of ['cs-cz','sk-sk']){
 const map=read(platform,locale).charMap;
 expect(map['ď'].steps).toEqual([{code:'Equal',modifiers:['ShiftLeft'],dead:true},{code:'KeyD'}]);expect(map['Á'].steps).toEqual([{code:'Equal',dead:true},{code:'KeyA',modifiers:['ShiftRight']}]);
 expect(map['?'].steps).toEqual([{code:'Comma',modifiers:['ShiftLeft']}]);expect(map[';'].steps).not.toEqual(map['?'].steps);
 }
 expect(read('windows','sk-sk').charMap['ľ'].code).toBe('Digit2');expect(read('windows','cs-cz').charMap['ě'].code).toBe('Digit2');
 expect(read('windows','sk-sk').charMap['@'].steps).toEqual([{code:'KeyV',modifiers:['AltRight']}]);expect(read('mac','sk-sk').charMap['@'].steps).toEqual([{code:'Digit2',modifiers:['AltRight']}]);
});
test('Spanish Spain supports ñ, ç, acute and diaeresis without a Latin American substitution',()=>{
 for(const platform of ['mac','windows']){
 const map=read(platform,'es-es').charMap;
 expect(map['ñ'].steps).toEqual([{code:'Semicolon'}]);expect(map['ç'].steps).toEqual([{code:'Backslash'}]);expect(map['á'].steps).toEqual([{code:'Quote',dead:true},{code:'KeyA'}]);expect(map['ü'].steps).toEqual([{code:'Quote',modifiers:['ShiftLeft'],dead:true},{code:'KeyU'}]);
 }
});
test('US is standard Windows, and native Mac preserves distinct ISO/ANSI extra-key behavior',()=>{
 const mac=read('mac','en-us'),win=read('windows','en-us');
 expect(mac.charMap['`'].code).toBe('IntlBackslash');expect(mac.charMap['§'].code).toBe('Backquote');expect(mac.variants.ansi.charMap['`'].code).toBe('Backquote');expect(win.charMap['"'].steps).toEqual([{code:'Quote',modifiers:['ShiftLeft']}]);expect(win.charMap['á']).toBeUndefined();
 expect(read('windows','es-es').variants.ansi.charMap['<']).toBeUndefined();
});
test('loader resolves platform and physical variant without leaking unresolved variants',async()=>{
 vi.stubGlobal('fetch',vi.fn(async path=>{const [,platform,file]=String(path).match(/keyboard-layouts\/(.*?)\/(.*?).json/);return {ok:true,json:async()=>read(platform,file)};}));
 expect((await loadKeyboardLayout('en-us','mac','ansi')).charMap['`'].code).toBe('Backquote');expect((await loadKeyboardLayout('en-us','mac','iso')).charMap['`'].code).toBe('IntlBackslash');expect(await loadKeyboardLayout()).not.toHaveProperty('variants');await expect(loadKeyboardLayout('../bad','mac')).rejects.toThrow('Unknown');
});
