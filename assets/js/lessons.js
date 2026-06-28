const CHAR_TO_CODE = {
  " ": "Space",
  "'": "Quote",
  ",": "Comma",
  "-": "Minus",
  ".": "Period",
  "/": "Slash",
  ";": "Semicolon",
  "=": "Equal",
  0: "Digit0",
  1: "Digit1",
  2: "Digit2",
  3: "Digit3",
  4: "Digit4",
  5: "Digit5",
  6: "Digit6",
  7: "Digit7",
  8: "Digit8",
  9: "Digit9",
  a: "KeyA",
  b: "KeyB",
  c: "KeyC",
  d: "KeyD",
  e: "KeyE",
  f: "KeyF",
  g: "KeyG",
  h: "KeyH",
  i: "KeyI",
  j: "KeyJ",
  k: "KeyK",
  l: "KeyL",
  m: "KeyM",
  n: "KeyN",
  o: "KeyO",
  p: "KeyP",
  q: "KeyQ",
  r: "KeyR",
  s: "KeyS",
  t: "KeyT",
  u: "KeyU",
  v: "KeyV",
  w: "KeyW",
  x: "KeyX",
  y: "KeyY",
  z: "KeyZ"
};

function targetsFromText(text) {
  return text.split("").map((char) => ({
    char,
    code: CHAR_TO_CODE[char.toLowerCase()] || ""
  }));
}

export const LESSONS = [
  {
    id: "home-row",
    name: "1. Home row",
    phase: "Rows",
    description: "Zakladne klavesy A S D F J K L ;",
    text: "asdf jkl; asdf jkl;"
  },
  {
    id: "top-row",
    name: "2. Upper row",
    phase: "Rows",
    description: "Pohyb z home pozicie na Q W E R U I O P",
    text: "qwer uiop qaz wsx edc rfv ujm ik, ol. p;/"
  },
  {
    id: "bottom-row",
    name: "3. Lower row",
    phase: "Rows",
    description: "Spodny riadok a navrat na home row",
    text: "zxcv bnm, az sx dc fv jn km l, ;/"
  },
  {
    id: "all-letters",
    name: "4. All letters",
    phase: "Rows",
    description: "Vsetky pismena v kratkych skupinach",
    text: "quick red fox jumps back slowly"
  },
  {
    id: "simple-words",
    name: "5. Simple words",
    phase: "Words",
    description: "Kratke slova bez velkych pismen",
    text: "ask dad fall jazz kick look"
  },
  {
    id: "word-flow",
    name: "6. Word flow",
    phase: "Words",
    description: "Dlhsie jednoduche slova",
    text: "fresh desk quiet lamp yellow window"
  },
  {
    id: "short-phrases",
    name: "7. Short phrases",
    phase: "Phrases",
    description: "Jednoduche zmysluplne frazy",
    text: "a quick task is done well"
  },
  {
    id: "numbers-signs",
    name: "8. Numbers and signs",
    phase: "Numbers",
    description: "Cisla a zakladne znamienka",
    text: "12 34 56 78 90 5-2=3"
  },
  {
    id: "sentences",
    name: "9. Sentences",
    phase: "Sentences",
    description: "Jednoduche vety so znamienkami",
    text: "i write 2 short lines, then i rest."
  }
].map((lesson) => ({
  ...lesson,
  targets: targetsFromText(lesson.text)
}));

export function getLesson(id) {
  return LESSONS.find((lesson) => lesson.id === id) || LESSONS[0];
}
