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
  Slash: { finger: "right-pinky", homeCode: "Semicolon" }
};

const HOME_FINGERS = Object.values(FINGER_GUIDE).reduce((acc, item) => {
  acc[item.homeCode] = item.finger;
  return acc;
}, {});

function centerWithin(parentRect, childRect) {
  return {
    x: childRect.left - parentRect.left + childRect.width / 2,
    y: childRect.top - parentRect.top + childRect.height / 2
  };
}

function keyCenter(workbench, code) {
  const key = workbench.querySelector(`[data-code="${code}"]`);
  if (!key) {
    return null;
  }

  return centerWithin(workbench.getBoundingClientRect(), key.getBoundingClientRect());
}

function setFingerPosition(finger, center) {
  finger.style.setProperty("--finger-x", `${Math.round(center.x)}px`);
  finger.style.setProperty("--finger-y", `${Math.round(center.y)}px`);
}

export function getFingerForCode(code) {
  return FINGER_GUIDE[code] || null;
}

export function getHomeFingerForCode(code) {
  return HOME_FINGERS[code] || null;
}

export function updateHandGuide(workbench, targetCode) {
  const guide = FINGER_GUIDE[targetCode];
  const fingers = workbench.querySelectorAll("[data-finger]");
  const homeKeys = workbench.querySelectorAll(".key.is-home");

  fingers.forEach((finger) => {
    finger.classList.remove("is-active", "is-pressing");
  });

  homeKeys.forEach((key) => {
    key.classList.remove("is-finger-home");
  });

  Object.entries(HOME_FINGERS).forEach(([code, fingerName]) => {
    const homeCenter = keyCenter(workbench, code);
    const finger = workbench.querySelector(`[data-finger="${fingerName}"]`);
    const key = workbench.querySelector(`[data-code="${code}"]`);

    if (homeCenter && finger) {
      setFingerPosition(finger, homeCenter);
    }

    if (key) {
      key.classList.add("is-finger-home");
    }
  });

  if (!guide) {
    return;
  }

  const activeFinger = workbench.querySelector(`[data-finger="${guide.finger}"]`);
  const targetCenter = keyCenter(workbench, targetCode);
  const targetKey = workbench.querySelector(`[data-code="${targetCode}"]`);

  if (!activeFinger || !targetCenter) {
    return;
  }

  activeFinger.style.setProperty("--target-x", `${Math.round(targetCenter.x)}px`);
  activeFinger.style.setProperty("--target-y", `${Math.round(targetCenter.y)}px`);
  activeFinger.classList.add("is-active");

  window.requestAnimationFrame(() => {
    activeFinger.classList.add("is-pressing");
  });

  if (targetKey) {
    targetKey.classList.add("is-finger-home");
  }
}
