const BASE_LABELS = {
  Escape: "Esc",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "-",
  Equal: "=",
  Backspace: "Back",
  Tab: "Tab",
  KeyQ: "Q",
  KeyW: "W",
  KeyE: "E",
  KeyR: "R",
  KeyT: "T",
  KeyY: "Y",
  KeyU: "U",
  KeyI: "I",
  KeyO: "O",
  KeyP: "P",
  BracketLeft: "[",
  BracketRight: "]",
  CapsLock: "Caps",
  KeyA: "A",
  KeyS: "S",
  KeyD: "D",
  KeyF: "F",
  KeyG: "G",
  KeyH: "H",
  KeyJ: "J",
  KeyK: "K",
  KeyL: "L",
  Semicolon: ";",
  Quote: "'",
  Enter: "Enter",
  ShiftLeft: "Shift",
  KeyZ: "Z",
  KeyX: "X",
  KeyC: "C",
  KeyV: "V",
  KeyB: "B",
  KeyN: "N",
  KeyM: "M",
  Comma: ",",
  Period: ".",
  Slash: "/",
  ShiftRight: "Shift",
  Fn: "Fn",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  AltLeft: "Alt",
  AltRight: "Alt",
  MetaLeft: "Cmd",
  MetaRight: "Cmd",
  Space: "Space"
};

export const KEYBOARD_LAYOUTS = {
  sk: {
    id: "sk",
    name: "Slovencina",
    labels: {
      ...BASE_LABELS,
      Digit2: "2 / l",
      Digit3: "3 / s",
      Digit4: "4 / c",
      Digit5: "5 / t",
      Digit6: "6 / z",
      Digit7: "7 / y",
      Digit8: "8 / a",
      Digit9: "9 / i",
      Digit0: "0 / e"
    }
  },
  cs: {
    id: "cs",
    name: "Cestina",
    labels: {
      ...BASE_LABELS,
      Digit2: "2 / e",
      Digit3: "3 / s",
      Digit4: "4 / c",
      Digit5: "5 / r",
      Digit6: "6 / z",
      Digit7: "7 / y",
      Digit8: "8 / a",
      Digit9: "9 / i",
      Digit0: "0 / e"
    }
  },
  "en-us": {
    id: "en-us",
    name: "US English",
    labels: BASE_LABELS
  },
  "en-gb": {
    id: "en-gb",
    name: "British English",
    labels: {
      ...BASE_LABELS,
      Digit3: "3 / £",
      Quote: "#",
      Backslash: "\\"
    }
  },
  es: {
    id: "es",
    name: "Spanielcina",
    labels: {
      ...BASE_LABELS,
      Semicolon: "Ñ",
      BracketLeft: "`",
      BracketRight: "+",
      Minus: "'",
      Equal: "¡"
    }
  }
};

export function getKeyboardLayout(id) {
  return KEYBOARD_LAYOUTS[id] || KEYBOARD_LAYOUTS.sk;
}
