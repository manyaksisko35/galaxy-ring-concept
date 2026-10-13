'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { buildCase, buildRing, type CaseRig, type RingRig } from '@/lib/ringModel';
import { DEFAULT_FINISH, type Finish } from '@/lib/theme';

export const MM = 0.06;

export type Rig = {
  ring: RingRig;
  ringPivot: THREE.Group;
  box: CaseRig;
  casePivot: THREE.Group;
  seatLocal: THREE.Vector3;
};

export function useRingRig(withCase = true): Rig {
  return useMemo(() => {
    const ring = buildRing(DEFAULT_FINISH.color, DEFAULT_FINISH.rough);
    const ringPivot = new THREE.Group();
    ringPivot.add(ring.root);
    const box = buildCase();
    const casePivot = new THREE.Group();
    box.root.position.y = -16;
    casePivot.add(box.root);
    casePivot.visible = withCase;
    const seatLocal = new THREE.Vector3(0, box.discTop + 3.5 - 16, 0);
    return { ring, ringPivot, box, casePivot, seatLocal };
  }, [withCase]);
}

export function applyFinish(rig: Rig, f: Finish) {
  rig.ring.shellMat.color.setHex(f.color);
  rig.ring.shellMat.roughness = f.rough;
}

export type Pose = {
  x: number;
  y: number;
  s: number;
  rx: number;
  ry: number;
  rz: number;
};

export type CasePose = Pose & { lid: number; show: number; seat: number };

const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const seatPos = new THREE.Vector3();
const seatQ = new THREE.Quaternion();

export function poseRig(rig: Rig, ring: Pose, box: CasePose) {
  const cp = rig.casePivot;
  cp.visible = box.show > 0.01;
  cp.position.set(box.x, box.y - (1 - box.show) * 4, 0);
  cp.rotation.set(box.rx, box.ry, box.rz);
  cp.scale.setScalar(box.s * MM);
  rig.box.hinge.rotation.x = -box.lid;
  cp.updateMatrixWorld(true);

  const rp = rig.ringPivot;
  tmpE.set(ring.rx, ring.ry, ring.rz);
  tmpQ.setFromEuler(tmpE);
  if (box.seat > 0.001) {
    seatPos.copy(rig.seatLocal).applyMatrix4(cp.matrixWorld);
    cp.getWorldQuaternion(seatQ);
    rp.position.set(ring.x, ring.y, 0).lerp(seatPos, box.seat);
    rp.quaternion.copy(tmpQ).slerp(seatQ, box.seat);
    rp.scale.setScalar(THREE.MathUtils.lerp(ring.s * MM, box.s * MM, box.seat));
  } else {
    rp.position.set(ring.x, ring.y, 0);
    rp.quaternion.copy(tmpQ);
    rp.scale.setScalar(ring.s * MM);
  }
}
