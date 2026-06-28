export const KEYBOARD_MODELS = {
  "macbook-air": {
    id: "macbook-air",
    name: "MacBook Air",
    rows: [
      ["Escape", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
      ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"],
      ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"],
      ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
      ["Fn", "ControlLeft", "AltLeft", "MetaLeft", "Space", "MetaRight", "AltRight"]
    ]
  },
  "dell-xps-2018": {
    id: "dell-xps-2018",
    name: "Dell XPS 2018",
    rows: [
      ["Escape", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
      ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"],
      ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
      ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
      ["ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "ControlRight"]
    ]
  }
};

export function getKeyboardModel(id) {
  return KEYBOARD_MODELS[id] || KEYBOARD_MODELS["macbook-air"];
}
