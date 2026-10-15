const FINGER_GUIDE = {
  Digit1: { finger: "left-pinky", homeCode: "KeyA" },
  KeyQ: { finger: "left-pinky", homeCode: "KeyA" },
  KeyA: { finger: "left-pinky", homeCode: "KeyA" },
  KeyZ: { finger: "left-pinky", homeCode: "KeyA" },
  Digit2: { finger: "left-ring", homeCode: "KeyS" },
  KeyW: { finger: "left-ring", homeCode: "KeyS" },
  KeyS: { finger: "left-ring", homeCode: "KeyS" },
  KeyX: { finger: "left-ring", homeCode: "KeyS" },
  Digit3: { finger: "left-middle", homeCode: "KeyD" },
  KeyE: { finger: "left-middle", homeCode: "KeyD" },
  KeyD: { finger: "left-middle", homeCode: "KeyD" },
  KeyC: { finger: "left-middle", homeCode: "KeyD" },
  Digit4: { finger: "left-index", homeCode: "KeyF" },
  Digit5: { finger: "left-index", homeCode: "KeyF" },
  KeyR: { finger: "left-index", homeCode: "KeyF" },
  KeyT: { finger: "left-index", homeCode: "KeyF" },
  KeyF: { finger: "left-index", homeCode: "KeyF" },
  KeyG: { finger: "left-index", homeCode: "KeyF" },
  KeyV: { finger: "left-index", homeCode: "KeyF" },
  KeyB: { finger: "left-index", homeCode: "KeyF" },
  Digit6: { finger: "right-index", homeCode: "KeyJ" },
  Digit7: { finger: "right-index", homeCode: "KeyJ" },
  KeyY: { finger: "right-index", homeCode: "KeyJ" },
  KeyU: { finger: "right-index", homeCode: "KeyJ" },
  KeyH: { finger: "right-index", homeCode: "KeyJ" },
  KeyJ: { finger: "right-index", homeCode: "KeyJ" },
  KeyN: { finger: "right-index", homeCode: "KeyJ" },
  KeyM: { finger: "right-index", homeCode: "KeyJ" },
  Digit8: { finger: "right-middle", homeCode: "KeyK" },
  KeyI: { finger: "right-middle", homeCode: "KeyK" },
  KeyK: { finger: "right-middle", homeCode: "KeyK" },
  Comma: { finger: "right-middle", homeCode: "KeyK" },
  Digit9: { finger: "right-ring", homeCode: "KeyL" },
  KeyO: { finger: "right-ring", homeCode: "KeyL" },
  KeyL: { finger: "right-ring", homeCode: "KeyL" },
  Period: { finger: "right-ring", homeCode: "KeyL" },
  Digit0: { finger: "right-pinky", homeCode: "Semicolon" },
  Minus: { finger: "right-pinky", homeCode: "Semicolon" },
  Equal: { finger: "right-pinky", homeCode: "Semicolon" },
  KeyP: { finger: "right-pinky", homeCode: "Semicolon" },
  Semicolon: { finger: "right-pinky", homeCode: "Semicolon" },
  Quote: { finger: "right-pinky", homeCode: "Semicolon" },
  Slash: { finger: "right-pinky", homeCode: "Semicolon" },
  BracketLeft: { finger: "right-pinky", homeCode: "Semicolon" },
  BracketRight: { finger: "right-pinky", homeCode: "Semicolon" },
  Backspace: { finger: "right-pinky", homeCode: "Semicolon" },
  Enter: { finger: "right-pinky", homeCode: "Semicolon" },
  Tab: { finger: "left-pinky", homeCode: "KeyA" },
  ShiftLeft: { finger: "left-pinky", homeCode: "KeyA" },
  ShiftRight: { finger: "right-pinky", homeCode: "Semicolon" },
  AltRight: { finger: "right-thumb", homeCode: "Space" },
  Space: { finger: "right-thumb", homeCode: "Space" }
};

const HOME_FINGERS = Object.values(FINGER_GUIDE).reduce((acc, item) => {
  acc[item.homeCode] = item.finger;
  return acc;
}, {});

const FINGER_NAMES = {
  "left-pinky": "Ľavý malíček", "left-ring": "Ľavý prstenník",
  "left-middle": "Ľavý prostredník", "left-index": "Ľavý ukazovák",
  "left-thumb": "Ľavý palec", "right-thumb": "Pravý palec",
  "right-index": "Pravý ukazovák", "right-middle": "Pravý prostredník",
  "right-ring": "Pravý prstenník", "right-pinky": "Pravý malíček"
};

export function getFingerForCode(code) { return FINGER_GUIDE[code] || null; }
export function getHomeFingerForCode(code) { return HOME_FINGERS[code] || null; }
export function getFingerName(finger) { return FINGER_NAMES[finger] || "Zložený znak"; }
export function getFingerClass(finger) { return finger ? `finger-${finger.split("-")[1]}` : ""; }

export function getModifierCodes(target) {
  const finger = getFingerForCode(target.code)?.finger;
  const codes = [];
  if (target.shift && finger) codes.push(finger.startsWith("left-") ? "ShiftRight" : "ShiftLeft");
  if (target.altGraph && target.code !== "AltRight") codes.push("AltRight");
  return codes;
}

export function renderHandIllustrations(container) {
  function hand(side) {
    const fingers = [
      { type: "pinky", x: 18, y: 48, height: 52 },
      { type: "ring", x: 46, y: 22, height: 80 },
      { type: "middle", x: 74, y: 10, height: 92 },
      { type: "index", x: 102, y: 28, height: 74 }
    ];
    const fingerMarkup = fingers.map(({type, x, y, height}) => `
      <g class="hand-finger finger-${type}" data-hand-finger="${side}-${type}">
        <rect x="${x}" y="${y}" width="24" height="${height}" rx="12"/>
        <circle class="finger-tip" data-tip="${side}-${type}" cx="${x+12}" cy="${y+14}" r="4"/>
        <circle class="finger-tip-ring" cx="${x+12}" cy="${y+14}" r="10"/>
      </g>`).join("");
    return `<svg class="hand-illustration" viewBox="0 0 172 165">
      <g${side === "right" ? ' transform="translate(172 0) scale(-1 1)"' : ""}>
        ${fingerMarkup}
        <g class="hand-finger finger-thumb" data-hand-finger="${side}-thumb">
          <path d="M119 94 L137 66 Q144 57 152 64 Q161 70 155 81 L137 119 Z"/>
          <circle class="finger-tip" data-tip="${side}-thumb" cx="146" cy="74" r="4"/>
          <circle class="finger-tip-ring" cx="146" cy="74" r="10"/>
        </g>
        <path class="hand-palm" d="M18 85 Q30 80 42 87 Q60 82 72 87 Q90 82 102 88 L126 85 Q134 99 141 104 L135 120 Q124 140 109 149 L107 158 L52 158 L49 147 Q23 130 20 111 Z"/>
        <path d="M55 119 Q80 107 106 119 M57 125 Q80 115 104 125" fill="none" stroke="#cdd7c6" stroke-width="1.5" stroke-linecap="round"/>
      </g>
      <text class="hand-label" x="86" y="164" text-anchor="middle">${side === "left" ? "ĽAVÁ RUKA" : "PRAVÁ RUKA"}</text>
    </svg>`;
  }
  container.innerHTML = hand("left") + hand("right");
}

export function updateHandGuide(workbench, target, enabled = true) {
  const guide = getFingerForCode(target.code);
  const modifiers = getModifierCodes(target);
  workbench.querySelectorAll("[data-hand-finger]").forEach((element) => {
    const active = enabled && (element.dataset.handFinger === guide?.finger ||
      modifiers.some((code) => getFingerForCode(code)?.finger === element.dataset.handFinger));
    element.classList.toggle("is-active", active);
  });
  const path = workbench.querySelector("#guidePath");
  const endpoint = workbench.querySelector("#guideEndpoint");
  const key = workbench.querySelector(`[data-code="${target.code}"]`);
  const tip = guide && workbench.querySelector(`[data-tip="${guide.finger}"]`);
  path.setAttribute("d", "");
  endpoint.style.display = "none";
  if (!enabled || !key || !tip) return;
  const parent = workbench.getBoundingClientRect();
  const a = tip.getBoundingClientRect();
  const b = key.getBoundingClientRect();
  const x1 = a.left + a.width / 2 - parent.left;
  const y1 = a.top + a.height / 2 - parent.top;
  const x2 = b.left + b.width / 2 - parent.left;
  const y2 = b.bottom - parent.top;
  const bend = (y1 + y2) / 2;
  path.setAttribute("d", `M ${x1} ${y1} C ${x1} ${bend}, ${x2} ${bend}, ${x2} ${y2}`);
  endpoint.setAttribute("cx", x2);
  endpoint.setAttribute("cy", y2);
  endpoint.style.display = "";
}
