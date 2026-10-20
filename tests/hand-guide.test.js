import { test, expect } from 'vitest';
import { buildHandPose, getFingerForCode, getModifierCodes, interpolateHandPose } from '../assets/js/hand-guide.js';
import { KEYBOARD_MODELS } from '../assets/js/keyboard-models.js';

// Deliberately physical geometry: labels are irrelevant, and ISO Enter's press
// point lies in its lower stem rather than the empty corner of its bounding box.
function keyboard(variant = 'iso') {
  const rows = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
    ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
    ['ShiftLeft', 'IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
    ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ControlRight']
  ];
  const keys = rows.flatMap((row, y) => row.map((code, x) => ({ code, x, y, width: .9, height: .9 })));
  Object.assign(keys.find(key => key.code === 'Space'), { x: 3, width: 6 });
  for (const [code, x] of [['AltRight', 9.2], ['MetaRight', 10.2], ['ControlRight', 11.2]]) keys.find(key => key.code === code).x = x;
  if (variant === 'iso') Object.assign(keys.find(key => key.code === 'Enter'), { shape: 'iso-enter', x: 12, y: 1, width: 1.5, height: 1.9, pressX: 13, pressY: 2.45 });
  return { id: 'test', name: 'Test keyboard', variant, width: 14, height: 5, keys, rows };
}

function expectedPoint(model, code) {
  const key = model.keys.find(key => key.code === code);
  return { x: key.pressX ?? key.x + key.width / 2, y: key.pressY ?? key.y + key.height / 2 };
}

test('every supported physical character contacts its key, with a comfortable point on wide keys', () => {
  for (const variant of ['iso', 'ansi']) {
    const model = keyboard(variant);
    for (const key of model.keys) {
      const guide = getFingerForCode(key.code);
      if (!guide) continue;
      const pose = buildHandPose(model, { code: key.code });
      const tip = pose.fingers[guide.finger].tip;
      if (key.width <= 1.3 || key.pressX != null) expect(tip).toEqual(expectedPoint(model, key.code));
      else {
        expect(tip.x).toBeGreaterThan(key.x);
        expect(tip.x).toBeLessThan(key.x + key.width);
        expect(tip.y).toBe(expectedPoint(model, key.code).y);
      }
      expect(pose.fingers[guide.finger].active).toBe(true);
      expect(pose.fingers[guide.finger].tip.x).toBeGreaterThanOrEqual(0);
      expect(pose.fingers[guide.finger].tip.x).toBeLessThanOrEqual(model.width);
      expect(pose.fingers[guide.finger].tip.y).toBeLessThanOrEqual(model.height);
    }
  }
});

test('ISO Enter uses the solid stem rather than its bounding-box centre', () => {
  const pose = buildHandPose(keyboard(), { code: 'Enter' });
  expect(pose.fingers['right-pinky'].tip).toEqual({ x: 13, y: 2.45 });
});

test('legacy uppercase uses opposite-hand Shift and explicit strokes preserve their physical side', () => {
  expect(getModifierCodes({ code: 'KeyA', shift: true })).toEqual(['ShiftRight']);
  expect(getModifierCodes({ code: 'KeyJ', shift: true })).toEqual(['ShiftLeft']);
  expect(getModifierCodes({ code: 'KeyA', shift: true, steps: [{ code: 'KeyA', modifiers: [] }] })).toEqual([]);
  expect(getModifierCodes({ code: 'KeyA', steps: [{ code: 'KeyA', modifiers: ['ShiftLeft', 'AltRight', 'AltRight'] }] })).toEqual(['ShiftLeft', 'AltRight']);
});

test('Shift plus Option and further modifiers move distinct fingertips simultaneously', () => {
  const model = keyboard();
  const target = { code: 'KeyA', steps: [{ code: 'KeyA', modifiers: ['ShiftLeft', 'AltLeft', 'MetaLeft', 'ControlRight'] }] };
  const pose = buildHandPose(model, target);
  expect(pose.assignments).toHaveLength(5);
  expect(new Set(pose.assignments.map(item => item.finger)).size).toBe(5);
  for (const { code, finger } of pose.assignments) {
    expect(pose.fingers[finger].tip).toEqual(expectedPoint(model, code));
    expect(pose.fingers[finger].code).toBe(code);
  }
  expect(pose.assignments[0]).toEqual({ code: 'KeyA', finger: 'left-pinky' });
});

test('all usual modifier combinations avoid collisions even for pinky and thumb target keys', () => {
  const model = keyboard();
  for (const code of ['KeyA', 'Enter', 'Space', 'Backquote', 'KeyJ']) {
    for (const modifiers of [['ShiftRight'], ['ShiftLeft', 'AltRight'], ['ShiftRight', 'AltLeft'], ['ControlLeft', 'MetaLeft', 'AltLeft', 'ShiftLeft']]) {
      const pose = buildHandPose(model, { code, steps: [{ code, modifiers }] });
      expect(pose.assignments).toHaveLength(1 + modifiers.length);
      expect(new Set(pose.assignments.map(item => item.finger)).size).toBe(pose.assignments.length);
    }
  }
});

test('a dead-key sequence shows only the current physical stroke', () => {
  const model = keyboard();
  const pose = buildHandPose(model, { code: 'KeyA', steps: [{ code: 'Quote', modifiers: ['AltLeft'], dead: true }, { code: 'KeyA' }] });
  expect(pose.assignments.map(item => item.code)).toEqual(['Quote', 'AltLeft']);
});

test('neutral fingers rest on home keys and palms are mirrored toward their own thumbs', () => {
  const pose = buildHandPose(keyboard(), null);
  for (const [code, finger] of [['KeyA', 'left-pinky'], ['KeyF', 'left-index'], ['KeyJ', 'right-index'], ['Semicolon', 'right-pinky']]) {
    expect(pose.fingers[finger].tip).toEqual(expectedPoint(keyboard(), code));
    expect(pose.fingers[finger].active).toBe(false);
  }
  expect(pose.palms.left.outerX).toBeLessThan(pose.palms.left.innerX);
  expect(pose.palms.right.outerX).toBeGreaterThan(pose.palms.right.innerX);
  expect(pose.fingers['left-thumb'].tip.x).toBeLessThan(pose.fingers['right-thumb'].tip.x);
});

test('changing printed locale labels leaves physical finger poses unchanged', () => {
  const model = keyboard();
  const relabelled = { ...model, keys: model.keys.map(key => ({ ...key, label: key.code === 'KeyY' ? 'Z' : 'ø' })) };
  expect(buildHandPose(model, { code: 'KeyY', shift: true })).toEqual(buildHandPose(relabelled, { code: 'KeyY', shift: true }));
});

function assertRigidFinger(finger) {
  expect(finger.joints).toHaveLength(4);
  for (let i = 0; i < 3; i++) {
    const a = finger.joints[i], b = finger.joints[i + 1];
    expect(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z)).toBeCloseTo(finger.lengths[i], 6);
  }
  const end = finger.joints[3];
  expect(Math.hypot(end.x - finger.tip.x, end.y - finger.tip.y, end.z)).toBeLessThan(.002);
  for (const joint of finger.joints) expect(joint.z).toBeGreaterThan(-.002);
}

test.each(Object.values(KEYBOARD_MODELS))('rigid anatomical links stay above the keyboard across chords: $id', (model) => {
    const neutral = buildHandPose(model, null);
    for (const key of model.keys.filter(key => getFingerForCode(key.code))) {
      for (const modifiers of [[], ['ShiftRight'], ['ShiftLeft', 'AltRight'], ['ControlLeft', 'MetaLeft', 'AltLeft', 'ShiftLeft']]) {
        const pose = buildHandPose(model, { code: key.code, steps: [{ code: key.code, modifiers }] });
        for (const [name, finger] of Object.entries(pose.fingers)) {
          expect(finger.lengths).toEqual(neutral.fingers[name].lengths);
          assertRigidFinger(finger);
        }
      }
    }
});

test('a distant reach moves the palm and keeps its knuckle spacing and finger proportions', () => {
  const model = KEYBOARD_MODELS['macbook-air'];
  const home = buildHandPose(model, null), reach = buildHandPose(model, { code: 'Digit1' });
  expect(reach.palms.left.rootY).toBeLessThan(home.palms.left.rootY - 1);
  const spacing = pose => Math.hypot(pose.fingers['left-index'].base.x - pose.fingers['left-pinky'].base.x, pose.fingers['left-index'].base.y - pose.fingers['left-pinky'].base.y);
  expect(spacing(reach)).toBeCloseTo(spacing(home), 6);
  const length = type => home.fingers[`left-${type}`].lengths.reduce((a, b) => a + b, 0);
  expect(length('middle')).toBeGreaterThan(length('index'));
  expect(length('index')).toBeGreaterThan(length('pinky'));
});

test('wide modifier and space keys are contacted on an accessible part of the cap', () => {
  const model = KEYBOARD_MODELS['macbook-air'];
  for (const code of ['Space', 'ShiftRight', 'Backspace']) {
    const pose = buildHandPose(model, { code });
    const finger = pose.fingers[getFingerForCode(code).finger];
    const key = model.keys.find(key => key.code === code);
    expect(finger.tip.x).toBeGreaterThan(key.x + .1);
    expect(finger.tip.x).toBeLessThan(key.x + key.width - .1);
    expect(Math.abs(finger.tip.x - expectedPoint(model, code).x)).toBeGreaterThan(.1);
    assertRigidFinger(finger);
  }
});

test('animation solves each in-between pose without stretching its finger links', () => {
  const model = KEYBOARD_MODELS['macbook-air'];
  for (const [start, end] of [['KeyW', 'Digit1'], ['Enter', 'Space'], ['KeyB', 'KeyR']]) {
    const from = buildHandPose(model, { code: start }), to = buildHandPose(model, { code: end });
    for (const amount of [.1, .25, .5, .75, .9]) {
      for (const finger of Object.values(interpolateHandPose(from, to, amount).fingers)) assertRigidFinger(finger);
    }
  }
  const from = buildHandPose(model, null), to = buildHandPose(model, { code: 'Digit0', steps: [{ code: 'Digit0', modifiers: ['ShiftLeft', 'AltRight'] }] });
  expect(Math.abs(to.palms.right.angle)).toBeGreaterThan(0);
  const spacing = pose => Math.hypot(pose.fingers['right-index'].base.x - pose.fingers['right-pinky'].base.x, pose.fingers['right-index'].base.y - pose.fingers['right-pinky'].base.y);
  for (const amount of [.1, .25, .5, .75, .9]) {
    const pose = interpolateHandPose(from, to, amount);
    expect(spacing(pose)).toBeCloseTo(spacing(from), 6);
    for (const finger of Object.values(pose.fingers)) assertRigidFinger(finger);
  }
});
