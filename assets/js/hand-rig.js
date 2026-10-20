import { Bone3D, Chain3D, V3 } from '../vendor/fullik/fik.module.js';

// Stylised adult-hand proportions in letter-key pitches. Lengths are fixed in
// 3D; a curled finger looks shorter in the keyboard plane, never stretched.
const ANATOMY = {
  pinky: { x: 0, y: .16, lengths: [.94, .57, .43], radius: .275 },
  ring: { x: .9, y: -.12, lengths: [1.28, .76, .52], radius: .31 },
  middle: { x: 1.83, y: -.22, lengths: [1.41, .85, .56], radius: .325 },
  index: { x: 2.72, y: .02, lengths: [1.3, .77, .53], radius: .32 },
  thumb: { x: 3.05, y: 1.65, lengths: [.88, .72, .57], radius: .36 }
};
const HOME_CODES = { left: ['KeyA', 'KeyS', 'KeyD', 'KeyF'], right: ['Semicolon', 'KeyL', 'KeyK', 'KeyJ'] };
const pointOnKey = key => ({ x: key.pressX ?? key.x + key.width / 2, y: key.pressY ?? key.y + key.height / 2 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const sum = values => values.reduce((a, b) => a + b, 0);
const bends = new Map();

function contact(key, finger, unit) {
  const center = pointOnKey(key);
  // A thumb uses its side of the spacebar; a pinky uses the near end of Shift.
  // Reaching the centre of every wide key is unnecessary and distorts a hand.
  if (key.pressX == null && key.width > 1.3 * unit) center.x = Math.max(key.x + .3 * unit, Math.min(key.x + key.width - .3 * unit, finger.tip.x));
  return center;
}

function restHand(model, side, keys, unit) {
  const direction = side === 'left' ? 1 : -1;
  const homes = HOME_CODES[side].map((code, i) => keys.has(code) ? pointOnKey(keys.get(code)) : { x: model.width * (side === 'left' ? .15 : .85) + direction * i * unit, y: model.height * .5 });
  const root = { x: homes[0].x - direction * .1 * unit, y: homes[0].y + unit };
  const rest = {};
  for (const [index, [type, anatomy]] of Object.entries(ANATOMY).entries()) {
    const base = { x: root.x + direction * anatomy.x * unit, y: root.y + anatomy.y * unit };
    const tip = type === 'thumb' ? { x: root.x + direction * 4.05 * unit, y: keys.has('Space') ? pointOnKey(keys.get('Space')).y + .08 * unit : root.y + unit } : homes[index];
    rest[`${side}-${type}`] = { base, tip, type, side, unit, radius: anatomy.radius * unit, lengths: anatomy.lengths.map(length => length * unit) };
  }
  return { direction, root, rest };
}

/** Fullik solves the three rigid links in each finger's vertical bending plane. */
export function articulateFinger(finger) {
  const { base, tip, lengths } = finger;
  const reach = distance(base, tip);
  const axis = reach > 1e-8 ? { x: (tip.x - base.x) / reach, y: (tip.y - base.y) / reach } : { x: 0, y: -1 };
  // A close lower-row contact curls under a raised knuckle, not through the cap.
  const height = finger.type === 'thumb'
    ? .35 * finger.unit + Math.max(0, .75 * finger.unit - reach) * .65
    : .55 * finger.unit + Math.max(0, 1.15 * finger.unit - reach) * .9;
  const cacheKey = `${finger.type}:${finger.unit}:${reach.toFixed(6)}`;
  let local = bends.get(cacheKey);
  if (!local) {
    const chain = new Chain3D();
    chain.setSolveDistanceThreshold(.00001);
    chain.setMinIterationChange(.0000001);
    chain.setMaxIterationAttempts(60);
    const first = new V3(.72, 0, .69);
    chain.addBone(new Bone3D(new V3(0, 0, height), undefined, first, lengths[0]));
    chain.addConsecutiveRotorConstrainedBone(new V3(.85, 0, -.53), lengths[1], 115);
    chain.addConsecutiveRotorConstrainedBone(new V3(.22, 0, -.98), lengths[2], 100);
    chain.solveForTarget(new V3(reach, 0, 0));
    local = [chain.bones[0].start, ...chain.bones.map(bone => bone.end)].map(p => ({ x: p.x, z: p.z }));
    if (bends.size > 512) bends.clear();
    bends.set(cacheKey, local);
  }
  const joints = local.map(p => ({ x: base.x + axis.x * p.x, y: base.y + axis.y * p.x, z: p.z }));
  return { ...finger, joints };
}

/** Rigid palm translation follows reaches; it never rescales fingers or a palm. */
function handTravel(rest, assignments, keys, unit) {
  const active = assignments.map(a => ({ finger: rest[a.finger], target: contact(keys.get(a.code), rest[a.finger], unit) }));
  let travel = { x: 0, y: 0 };
  if (!active.length) return travel;
  // A small anticipatory hand movement shares the reach with the active digit.
  for (const { finger, target } of active) {
    travel.x += (target.x - finger.tip.x) * .38 / active.length;
    travel.y += (target.y - finger.tip.y) * .38 / active.length;
  }
  // The palm retreats for the bottom row so fingers curl toward their tips,
  // instead of folding back through their own knuckles.
  const retreat = active.filter(({ finger }) => finger.type !== 'thumb').map(({ finger, target }) => target.y + .78 * unit - finger.base.y);
  if (retreat.length) travel.y = Math.max(travel.y, Math.max(...retreat));
  // Project the palm onto the intersection of comfortable finger reach discs.
  // Extra modifiers may need a wider spread, still below the true bone length.
  for (const fraction of [.76, .93]) {
    for (let pass = 0; pass < 32; pass++) {
      for (const { finger, target } of active) {
        const center = { x: target.x - finger.base.x, y: target.y - finger.base.y };
        const d = distance(travel, center);
        const radius = Math.sqrt((sum(finger.lengths) * fraction) ** 2 - (.55 * unit) ** 2);
        if (d > radius) {
          const amount = (d - radius) / d;
          travel = { x: travel.x + (center.x - travel.x) * amount, y: travel.y + (center.y - travel.y) * amount };
        }
      }
    }
    if (active.every(({ finger, target }) => distance({ x: finger.base.x + travel.x, y: finger.base.y + travel.y }, target) < sum(finger.lengths) * .94)) break;
  }
  return travel;
}

function positionHand(model, side, keys, unit, assigned) {
  const original = restHand(model, side, keys, unit);
  const pivot = { x: original.root.x + original.direction * 1.3 * unit, y: original.root.y + unit };
  let best;
  for (const degrees of assigned.length > 1 ? [0, -18, 18, -36, 36, -50, 50] : [0]) {
    const angle = degrees * Math.PI / 180;
    const rotate = p => ({ x: pivot.x + Math.cos(angle) * (p.x - pivot.x) - Math.sin(angle) * (p.y - pivot.y), y: pivot.y + Math.sin(angle) * (p.x - pivot.x) + Math.cos(angle) * (p.y - pivot.y) });
    const rest = Object.fromEntries(Object.entries(original.rest).map(([name, finger]) => [name, { ...finger, base: rotate(finger.base), tip: rotate(finger.tip) }]));
    const travel = handTravel(rest, assigned, keys, unit);
    let cost = (travel.x ** 2 + travel.y ** 2) * .03 + angle ** 2 * .16;
    for (const a of assigned) {
      const finger = rest[a.finger], target = contact(keys.get(a.code), finger, unit);
      const reach = Math.hypot(target.x - finger.base.x - travel.x, target.y - finger.base.y - travel.y, (finger.type === 'thumb' ? .35 : .55) * unit);
      cost += Math.max(0, reach - sum(finger.lengths) * .96) ** 2 * 100000;
    }
    if (!best || cost < best.cost) best = { ...original, rest, travel, degrees, pivot, cost };
  }
  return best;
}

/** Rank modifier allocations by reach before considering conventional fingers. */
export function assignmentReachCost(model, assignments) {
  const keys = new Map(model.keys.map(key => [key.code, key]));
  const unit = keys.has('KeyS') && keys.has('KeyA') ? Math.abs(keys.get('KeyS').x - keys.get('KeyA').x) : 1;
  let cost = 0;
  for (const side of ['left', 'right']) {
    const assigned = assignments.filter(a => a.finger.startsWith(side));
    cost += positionHand(model, side, keys, unit, assigned).cost;
  }
  return cost;
}

export function buildRigPose(model, assignments) {
  const keys = new Map(model.keys.map(key => [key.code, key]));
  const unit = keys.has('KeyS') && keys.has('KeyA') ? Math.abs(keys.get('KeyS').x - keys.get('KeyA').x) : 1;
  const fingers = {}, palms = {};
  for (const side of ['left', 'right']) {
    const assigned = assignments.filter(a => a.finger.startsWith(side));
    const { direction, root, rest, travel, degrees, pivot } = positionHand(model, side, keys, unit, assigned);
    const move = p => ({ x: p.x + travel.x, y: p.y + travel.y });
    for (const [name, finger] of Object.entries(rest)) {
      const assignment = assigned.find(a => a.finger === name);
      fingers[name] = articulateFinger({ ...finger, base: move(finger.base), tip: assignment ? contact(keys.get(assignment.code), finger, unit) : move(finger.tip), active: Boolean(assignment), code: assignment?.code || null });
    }
    palms[side] = {
      outerX: root.x + travel.x, innerX: root.x + direction * 2.72 * unit + travel.x,
      rootY: root.y + travel.y, bottomY: root.y + 3.45 * unit + travel.y,
      wristX: root.x + direction * 1.3 * unit + travel.x, wristY: root.y + 2.2 * unit + travel.y,
      direction, unit, travel, angle: degrees, pivotX: pivot.x + travel.x, pivotY: pivot.y + travel.y
    };
  }
  return { width: model.width, height: model.height, fingers, palms, assignments };
}
