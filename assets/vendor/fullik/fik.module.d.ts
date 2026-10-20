export class V3 { constructor(x: number, y: number, z: number); x: number; y: number; z: number; }
export class Bone3D { constructor(start: V3, end?: V3, direction?: V3, length?: number); start: V3; end: V3; }
export class Chain3D {
  bones: Bone3D[];
  setSolveDistanceThreshold(value: number): void;
  setMinIterationChange(value: number): void;
  setMaxIterationAttempts(value: number): void;
  addBone(bone: Bone3D): void;
  addConsecutiveRotorConstrainedBone(direction: V3, length: number, angle: number): void;
  solveForTarget(target: V3): number;
}
