export const DEFAULT_LAYOUT_ID = 'en-gb';
export const KEYBOARD_LOCALES = [
  {id:'sk-sk',name:'Slovenčina'}, {id:'cs-cz',name:'Čeština'},
  {id:'es-es',name:'Español (España)'}, {id:'en-us',name:'English (US)'}, {id:'en-gb',name:'English (UK)'}
];
export const KEYBOARD_PLATFORMS = [{id:'mac',name:'macOS'},{id:'windows',name:'Windows'}];
/** @returns {Promise<import('./types').KeyboardLayout>} */
export async function loadKeyboardLayout(locale = DEFAULT_LAYOUT_ID, platform = 'mac', variant = 'iso') {
  if (!['iso','ansi'].includes(variant)) throw new Error('Unknown keyboard variant');
  if (!KEYBOARD_LOCALES.some(item=>item.id===locale) || !KEYBOARD_PLATFORMS.some(item=>item.id===platform)) throw new Error('Unknown keyboard profile');
  const response = await fetch(`content/keyboard-layouts/${platform}/${locale}.json`, {cache:'no-cache'});
  if (!response.ok) throw new Error(`Cannot load keyboard layout ${locale}/${platform}: ${response.status}`);
  const data = await response.json();
  return variant === 'ansi' && data.variants?.ansi ? data.variants.ansi : {id:data.id,name:data.name,platform:data.platform,labels:data.labels,charMap:data.charMap};
}
