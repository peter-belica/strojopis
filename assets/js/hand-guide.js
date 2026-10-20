import { articulateFinger, assignmentReachCost, buildRigPose } from './hand-rig.js';

const FINGER_GUIDE = {
  Backquote: { finger: "left-pinky", homeCode: "KeyA" },
  Escape: { finger: "left-pinky", homeCode: "KeyA" },
  CapsLock: { finger: "left-pinky", homeCode: "KeyA" },
  IntlBackslash: { finger: "left-pinky", homeCode: "KeyA" },
  Backslash: { finger: "right-pinky", homeCode: "Semicolon" },
  ControlLeft: { finger: "left-pinky", homeCode: "KeyA" },
  ControlRight: { finger: "right-pinky", homeCode: "Semicolon" },
  AltLeft: { finger: "left-thumb", homeCode: "Space" },
  MetaLeft: { finger: "left-thumb", homeCode: "Space" },
  MetaRight: { finger: "right-thumb", homeCode: "Space" },
  Fn: { finger: "left-pinky", homeCode: "KeyA" },
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

const HOME_FINGERS = { KeyA: "left-pinky", KeyS: "left-ring", KeyD: "left-middle", KeyF: "left-index", KeyJ: "right-index", KeyK: "right-middle", KeyL: "right-ring", Semicolon: "right-pinky", Space: "right-thumb" };
const FINGER_NAMES = {
  "left-pinky": "Ľavý malíček", "left-ring": "Ľavý prstenník",
  "left-middle": "Ľavý prostredník", "left-index": "Ľavý ukazovák",
  "left-thumb": "Ľavý palec", "right-thumb": "Pravý palec",
  "right-index": "Pravý ukazovák", "right-middle": "Pravý prostredník",
  "right-ring": "Pravý prstenník", "right-pinky": "Pravý malíček"
};
const FINGER_TYPES = ["pinky", "ring", "middle", "index", "thumb"];
const animationStates = new WeakMap();

export function getFingerForCode(code) { return FINGER_GUIDE[code] || null; }
export function getHomeFingerForCode(code) { return HOME_FINGERS[code] || null; }
export function getFingerName(finger) { return FINGER_NAMES[finger] || "Zložený znak"; }
export function getFingerClass(finger) { return finger ? `finger-${finger.split("-")[1]}` : ""; }

/** Explicit strokes contain physical codes; legacy targets choose the opposite Shift. */
export function getModifierCodes(target) {
  if (Array.isArray(target?.steps?.[0]?.modifiers)) return [...new Set(target.steps[0].modifiers)];
  const finger = getFingerForCode(target?.code)?.finger;
  const codes = [];
  if (target?.shift && finger) codes.push(finger.startsWith("left-") ? "ShiftRight" : "ShiftLeft");
  if (target?.altGraph && target.code !== "AltRight") codes.push("AltRight");
  return codes;
}

function modifierFingers(code) {
  const side = code.endsWith("Right") ? "right" : "left";
  const types = code.startsWith("Shift") ? ["pinky", "ring", "thumb", "index", "middle"]
    : code.startsWith("Alt") || code.startsWith("Meta") ? ["thumb", "pinky", "ring", "index", "middle"]
      : ["pinky", "thumb", "ring", "index", "middle"];
  return types.map((type) => `${side}-${type}`);
}

/** Assign the character first, then distinct fingers to every modifier in the chord. */
function chordAssignments(target, keys, model) {
  const code = target?.steps?.[0]?.code || target?.code;
  const primary = getFingerForCode(code)?.finger;
  const assignments = primary && keys.has(code) ? [{ code, finger: primary }] : [];
  const modifiers = getModifierCodes(target).filter((modifier) => modifier !== code && keys.has(modifier));
  let best = assignments, bestCost = Infinity;
  const allocate = (index, chosen, preference) => {
    if (index === modifiers.length) {
      const cost = assignmentReachCost(model, chosen) + preference;
      if (cost < bestCost) { best = chosen; bestCost = cost; }
      return;
    }
    for (const [rank, finger] of modifierFingers(modifiers[index]).entries()) {
      if (chosen.some((item) => item.finger === finger)) continue;
      allocate(index + 1, [...chosen, { code: modifiers[index], finger }], preference + rank * .2);
    }
  };
  if (!modifiers.length) return assignments;
  allocate(0, assignments, 0);
  return best;
}

/**
 * A pure pose in keyboard units. Each tip contacts the physical key, using its
 * near edge for wide keys; changing a locale label cannot move a hand.
 * @param {import('./types').KeyboardModel} model
 * @param {Partial<import('./types').Target> | null} target
 */
export function buildHandPose(model, target) {
  const keys = new Map(model.keys.map((key) => [key.code, key]));
  return buildRigPose(model, chordAssignments(target, keys, model));
}

function number(value) { return Number(value.toFixed(3)); }
function point(point) { return `${number(point.x)} ${number(point.y)}`; }
function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

/** Rounded tapered links overlap into a smooth silhouette even in a tight curl.
 * A single outline around a folded centreline would self-intersect at the tip. */
function fingerGeometry(finger) {
  const radii = [1.12, 1, .88, .76].map(scale => scale * finger.radius);
  const segments = finger.joints.slice(1).map((b, i) => {
    const a = finger.joints[i], ra = radii[i], rb = radii[i + 1];
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const normal = { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
    const offset = (p, r) => point({ x: p.x + normal.x * r, y: p.y + normal.y * r });
    return `M ${offset(a, ra)} L ${offset(b, rb)} A ${number(rb)} ${number(rb)} 0 0 0 ${offset(b, -rb)} L ${offset(a, -ra)} A ${number(ra)} ${number(ra)} 0 0 0 ${offset(a, ra)} Z`;
  });
  return { shape: segments.join(' ') };
}

function palmPath(palm) {
  const { outerX: outer, innerX: inner, rootY: top, bottomY: bottom, wristX: wrist, wristY, direction: d, unit: u } = palm;
  const p = (x, y) => point({ x, y });
  return `M ${p(outer - d * .30 * u, top + .18 * u)}
    C ${p(outer + d * .35 * u, top - .22 * u)} ${p(inner - d * .85 * u, top - .5 * u)} ${p(inner + d * .24 * u, top - .02 * u)}
    C ${p(inner + d * .5 * u, top + .4 * u)} ${p(inner + d * .36 * u, top + .75 * u)} ${p(inner + d * .39 * u, top + 1.14 * u)}
    C ${p(inner + d * .55 * u, top + 1.72 * u)} ${p(wrist + d * 1.08 * u, wristY - .30 * u)} ${p(wrist + d * .94 * u, wristY)}
    C ${p(wrist + d * .96 * u, wristY + .35 * u)} ${p(wrist + d * 1.05 * u, bottom - .4 * u)} ${p(wrist + d * 1.08 * u, bottom)}
    L ${p(wrist - d * 1.12 * u, bottom)}
    C ${p(wrist - d * 1.05 * u, bottom - .4 * u)} ${p(wrist - d * .97 * u, wristY + .3 * u)} ${p(wrist - d * .96 * u, wristY)}
    C ${p(outer - d * .53 * u, top + 1.65 * u)} ${p(outer - d * .47 * u, top + .65 * u)} ${p(outer - d * .30 * u, top + .18 * u)} Z`;
}

/** Stable DOM: animation updates paths only, never rebuilds the overlay. */
export function renderHandIllustrations(container) {
  container.innerHTML = `<svg class="hand-overlay" viewBox="0 0 15 5" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="hand-wrist-fade" gradientUnits="userSpaceOnUse" x1="0" x2="0"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="hand-wrist-mask" maskUnits="userSpaceOnUse" x="-5" y="-5" width="30" height="20"><rect x="-5" y="-5" width="30" height="20" fill="url(#hand-wrist-fade)"/></mask>${["left", "right"].map((side) => FINGER_TYPES.map((type) => `<linearGradient id="finger-color-${side}-${type}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7950ce" stop-opacity="0"/><stop offset=".3" stop-color="#7950ce"/><stop offset="1" stop-color="#7950ce"/></linearGradient>`).join("")).join("")}</defs>${["left", "right"].map((side) => `<g class="articulated-hand" data-hand="${side}" mask="url(#hand-wrist-mask)"><g class="hand-silhouette"><path class="overlay-palm" data-palm="${side}"/><ellipse data-thumb-pad="${side}"/>${FINGER_TYPES.map((type) => `<path data-silhouette-finger="${side}-${type}"/>`).join("")}</g>${FINGER_TYPES.map((type) => `<g class="overlay-finger ${getFingerClass(`${side}-${type}`)}" data-hand-finger="${side}-${type}"><path class="overlay-finger-shape" fill="url(#finger-color-${side}-${type})"/><ellipse class="overlay-nail"/><circle class="overlay-contact" data-tip="${side}-${type}"/></g>`).join("")}</g>`).join("")}</svg>`;
}

function drawPose(svg, pose, pressedCodes) {
  const fade = svg.querySelector("#hand-wrist-fade");
  fade.setAttribute("y1", pose.height - .3);
  fade.setAttribute("y2", pose.height + 1.85);
  for (const side of ["left", "right"]) {
    const palm = pose.palms[side];
    const shape = svg.querySelector(`[data-palm="${side}"]`);
    shape.setAttribute("d", palmPath(palm));
    shape.setAttribute('transform', `rotate(${palm.angle} ${palm.pivotX} ${palm.pivotY})`);
    // The thenar pad blends the thumb root into the palm instead of leaving a
    // sharp tube-to-palm junction when the thumb bends across the spacebar.
    const thumb = pose.fingers[`${side}-thumb`];
    const pad = svg.querySelector(`[data-thumb-pad="${side}"]`);
    const center = { x: thumb.base.x - palm.direction * .23 * palm.unit, y: thumb.base.y - .02 * palm.unit };
    pad.setAttribute('cx', center.x);
    pad.setAttribute('cy', center.y);
    pad.setAttribute('rx', .59 * palm.unit);
    pad.setAttribute('ry', .73 * palm.unit);
    pad.setAttribute('transform', `rotate(${palm.angle - palm.direction * 20} ${point(center)})`);
  }
  for (const [name, finger] of Object.entries(pose.fingers)) {
    const group = svg.querySelector(`[data-hand-finger="${name}"]`);
    const geometry = fingerGeometry(finger);
    const color = svg.querySelector(`#finger-color-${name}`);
    color.setAttribute("x1", finger.base.x);
    color.setAttribute("y1", finger.base.y);
    color.setAttribute("x2", finger.tip.x);
    color.setAttribute("y2", finger.tip.y);
    svg.querySelector(`[data-silhouette-finger="${name}"]`).setAttribute("d", geometry.shape);
    group.querySelector(".overlay-finger-shape").setAttribute("d", geometry.shape);
    const nail = group.querySelector('.overlay-nail');
    const distal = finger.joints[2], tip = finger.joints[3];
    const nailCenter = mix(tip, distal, .27);
    nail.setAttribute('cx', number(nailCenter.x));
    nail.setAttribute('cy', number(nailCenter.y));
    nail.setAttribute('rx', number(finger.radius * .47));
    nail.setAttribute('ry', number(finger.radius * .56));
    nail.setAttribute('transform', `rotate(${number(Math.atan2(tip.y - distal.y, tip.x - distal.x) * 180 / Math.PI + 90)} ${point(nailCenter)})`);
    const contact = group.querySelector(".overlay-contact");
    contact.setAttribute("cx", finger.joints[3].x);
    contact.setAttribute("cy", finger.joints[3].y);
    contact.setAttribute("r", .11 * finger.unit);
    group.classList.toggle("is-active", finger.active);
    group.classList.toggle("is-pressed", Boolean(finger.code && pressedCodes.has(finger.code)));
    group.dataset.keyCode = finger.code || "";
  }
}

export function interpolateHandPose(from, to, amount) {
  const fingers = {}, palms = {};
  for (const [side, palm] of Object.entries(to.palms)) {
    palms[side] = { ...palm };
    for (const key of ['outerX', 'innerX', 'rootY', 'bottomY', 'wristX', 'wristY', 'angle', 'pivotX', 'pivotY']) palms[side][key] = from.palms[side][key] + (palm[key] - from.palms[side][key]) * amount;
  }
  for (const [name, finger] of Object.entries(to.fingers)) {
    // Interpolate the rigid palm transform, not each knuckle independently.
    // Linear interpolation of rotated knuckles would shrink the palm mid-turn.
    const destination = to.palms[finger.side], palm = palms[finger.side];
    const undo = -destination.angle * Math.PI / 180;
    const dx = finger.base.x - destination.pivotX, dy = finger.base.y - destination.pivotY;
    const local = { x: Math.cos(undo) * dx - Math.sin(undo) * dy, y: Math.sin(undo) * dx + Math.cos(undo) * dy };
    const angle = palm.angle * Math.PI / 180;
    const base = { x: palm.pivotX + Math.cos(angle) * local.x - Math.sin(angle) * local.y, y: palm.pivotY + Math.sin(angle) * local.x + Math.cos(angle) * local.y };
    fingers[name] = articulateFinger({ ...finger, base, tip: mix(from.fingers[name].tip, finger.tip, amount) });
  }
  return { ...to, fingers, palms };
}

/**
 * @param {HTMLElement} workbench
 * @param {Partial<import('./types').Target>} target
 * @param {boolean} enabled
 * @param {{model?: import('./types').KeyboardModel, pressedCodes?: Iterable<string>}} options
 */
export function updateHandGuide(workbench, target, enabled = true, options = {}) {
  const container = workbench.querySelector(".hand-guide");
  if (!container) return;
  const previous = animationStates.get(workbench);
  if (previous?.frame != null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(previous.frame);
  if (!enabled || !options.model) {
    container.setAttribute("hidden", "");
    animationStates.delete(workbench);
    return;
  }
  container.removeAttribute("hidden");
  if (!container.querySelector(".hand-overlay")) renderHandIllustrations(container);
  const svg = container.querySelector(".hand-overlay");
  if (!svg) return;
  const model = options.model;
  svg.setAttribute("viewBox", `0 0 ${model.width} ${model.height}`);
  const destination = buildHandPose(model, target);
  const signature = `${model.id}:${model.variant}:${model.width}:${model.height}`;
  const origin = previous?.signature === signature ? previous.pose : buildHandPose(model, null);
  const pressedCodes = new Set(options.pressedCodes || []);
  const state = { signature, pose: origin, frame: /** @type {number | null} */ (null) };
  animationStates.set(workbench, state);
  const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || typeof requestAnimationFrame !== "function") {
    state.pose = destination;
    drawPose(svg, destination, pressedCodes);
    return;
  }
  drawPose(svg, { ...origin, assignments: destination.assignments, fingers: Object.fromEntries(Object.entries(origin.fingers).map(([name, finger]) => [name, { ...finger, active: destination.fingers[name].active, code: destination.fingers[name].code }])) }, pressedCodes);
  let started;
  const animate = (time) => {
    if (animationStates.get(workbench) !== state) return;
    started ??= time;
    const progress = Math.min(1, (time - started) / 340);
    const eased = 1 - Math.pow(1 - progress, 3);
    state.pose = interpolateHandPose(origin, destination, eased);
    drawPose(svg, state.pose, pressedCodes);
    state.frame = progress < 1 ? requestAnimationFrame(animate) : null;
  };
  state.frame = requestAnimationFrame(animate);
}
