/** Physical coordinates use one letter-key pitch as one unit. Caps are inset by CSS. */
const LETTER_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/** @returns {import('./types').KeyboardModel} */
function makeModel(id, name, variant, mac) {
  /** @type {import('./types').KeyGeometry[]} */
  const keys = [];
  const rows = [];
  function row(y, entries, height = 1) {
    let x = 0;
    const codes = [];
    for (const [code, width = 1, label] of entries) {
      keys.push({ code, x, y, width, height, ...(label ? { label } : {}) });
      codes.push(code); x += width;
    }
    rows.push(codes);
  }
  // MacBook Air M3 has a full-height function row and a separate Touch ID cap.
  if (mac) row(0, [['Escape', 1.5, 'esc'], ...Array.from({length:12}, (_,i)=>[`F${i+1}`,1]), ['TouchID',1.5,'Touch ID']]);
  else row(.2, [['Escape',1,'Esc'], ...Array.from({length:12},(_,i)=>[`F${i+1}`,1]), ['Insert',1,'Ins'],['Delete',1,'Del']], .6);
  row(1, [['Backquote'], ...'1234567890'.split('').map(n=>[`Digit${n}`]), ['Minus'], ['Equal'], ['Backspace',2,'⌫']]);
  row(2, [['Tab',1.5,'⇥'], ...LETTER_ROWS[0].split('').map(n=>[`Key${n}`]), ['BracketLeft'], ['BracketRight'], ...(variant==='ansi'?[['Backslash',1.5]]:[])]);
  row(3, [['CapsLock',1.75,'⇪'], ...LETTER_ROWS[1].split('').map(n=>[`Key${n}`]), ['Semicolon'], ['Quote'], ...(variant==='iso'?[['Backslash',1]]:[['Enter',2.25,'↵']])]);
  if (variant === 'iso') {
    // ISO Return: upper arm is 1.5 u, lower stem 1.25 u. Empty notch is not a key.
    keys.push({code:'Enter',x:13.5,y:2,width:1.5,height:2,shape:'iso-enter',label:'↵',pressX:14.35,pressY:3.45});
    rows[2].push('Enter');
  }
  row(4, [['ShiftLeft',variant==='iso'?1.25:2.25,'⇧'], ...(variant==='iso'?[['IntlBackslash']]:[]), ...LETTER_ROWS[2].split('').map(n=>[`Key${n}`]), ['Comma'], ['Period'], ['Slash'], ['ShiftRight',2.75,'⇧']]);
  if (mac) {
    row(5, [['Fn',1,'fn'], ['ControlLeft',1,'⌃'], ['AltLeft',1,'⌥'], ['MetaLeft',1.25,'⌘'], ['Space',5.75,''], ['MetaRight',1.25,'⌘'], ['AltRight',1,'⌥']]);
  } else {
    row(5, [['ControlLeft',1.25,'Ctrl'], ['Fn',1,'Fn'], ['MetaLeft',1,'⊞'], ['AltLeft',1.25,'Alt'], ['Space',5.25,''], ['AltRight',1.25,'AltGr'], ['ControlRight',1,'Ctrl']]);
  }
  keys.push({code:'ArrowLeft',x:12.5,y:5.5,width:.8333,height:.5,label:'←'}, {code:'ArrowDown',x:13.3333,y:5.5,width:.8334,height:.5,label:'↓'}, {code:'ArrowUp',x:13.3333,y:5,width:.8334,height:.5,label:'↑'}, {code:'ArrowRight',x:14.1667,y:5.5,width:.8333,height:.5,label:'→'});
  if (!mac) {
    keys.push({code:'PageUp',x:12.5,y:5,width:.8333,height:.5,label:'PgUp'},{code:'PageDown',x:14.1667,y:5,width:.8333,height:.5,label:'PgDn'});
    rows[5].push('PageUp','PageDown');
  }
  rows[5].push('ArrowLeft','ArrowDown','ArrowUp','ArrowRight');
  return {id,name,variant,width:15,height:6,keys,rows};
}

/** @type {Record<string, import('./types').KeyboardModel>} */
export const KEYBOARD_MODELS = {
  'macbook-air': makeModel('macbook-air','MacBook Air M3 · ISO','iso',true),
  'macbook-air-ansi': makeModel('macbook-air-ansi','MacBook Air M3 · ANSI','ansi',true),
  'dell-xps-2018': makeModel('dell-xps-2018','Dell XPS 2018 · ISO','iso',false),
  'dell-xps-2018-ansi': makeModel('dell-xps-2018-ansi','Dell XPS 2018 · ANSI','ansi',false)
};

export function getKeyboardModel(id) { return KEYBOARD_MODELS[id] || KEYBOARD_MODELS['macbook-air']; }
/** @param {import('./types').KeyboardModel|string} model */
export function getKeyGeometry(model, code) { return (typeof model==='string'?getKeyboardModel(model):model).keys.find(key=>key.code===code) || null; }
