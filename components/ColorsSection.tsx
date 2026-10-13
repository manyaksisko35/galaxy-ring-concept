'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { RimLight, SoftShadow, StudioEnv } from '@/components/StudioEnv';
import { applyFinish, poseRig, useRingRig, type CasePose, type Pose } from '@/lib/ringRig';
import { FINISHES, setFinish, useFinish, type Finish } from '@/lib/theme';
import { createSpin, stepSpin, useDragSpin } from '@/lib/dragSpin';
import { prefersReducedMotion } from '@/lib/useReducedMotion';
import { PRICE } from '@/lib/specs';

const spin = createSpin();
const NO_CASE: CasePose = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, lid: 0, show: 0, seat: 0 };

function Product({ finish }: { finish: Finish }) {
  const rig = useRingRig(false);
  const invalidate = useThree((s) => s.invalidate);
  const turn = useRef(0);
  const reduce = useRef(prefersReducedMotion());
  const frame = useRef<Pose>({ x: 0, y: 0.1, s: 1.5, rx: 0.55, ry: 0.4, rz: 0.2 });

  useEffect(() => {
    applyFinish(rig, finish);
    invalidate();
  }, [rig, finish, invalidate]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    stepSpin(spin, dt);
    if (!reduce.current && !spin.dragging) turn.current += dt * 0.3;
    const f = frame.current;
    f.rx = 0.55 + Math.sin(turn.current * 0.7) * 0.2 + spin.pitch;
    f.ry = 0.4 + turn.current + spin.yaw;
    poseRig(rig, f, NO_CASE);
  });

  return (
    <>
      <primitive object={rig.ringPivot} />
      <SoftShadow y={-1.1} width={2.2} depth={1.2} opacity={0.45} />
    </>
  );
}

export default function ColorsSection() {
  const finish = useFinish();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pick = useCallback(() => spin, []);
  useDragSpin(stageRef, pick);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const mount = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '150% 0px' });
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    mount.observe(el);
    vis.observe(el);
    return () => {
      mount.disconnect();
      vis.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} id="colors" className="sg-ambient amb-silver relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="text-center mb-6 lg:mb-10">
        <p className="sg-eyebrow mb-3 lg:mb-5">Colors</p>
        <h2 className="sg-title">
          Three finishes. <strong className="sg-ai">All titanium.</strong>
        </h2>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 max-w-6xl mx-auto">
        <div ref={stageRef} className="relative w-full max-w-[560px] h-[44svh] lg:h-[60svh] touch-pan-y select-none cursor-grab data-[dragging]:cursor-grabbing">
          {mounted && (
            <Canvas
              frameloop={visible ? 'always' : 'never'}
              camera={{ position: [0, 0.4, 6], fov: 30 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
            >
              <StudioEnv intensity={1.1} />
              <RimLight />
              <ambientLight intensity={0.5} />
              <directionalLight position={[3, 4, 4]} intensity={2} />
              <Suspense fallback={null}>
                <Product finish={finish} />
              </Suspense>
            </Canvas>
          )}
          <p className="absolute bottom-1 inset-x-0 text-center text-xs text-white/40 pointer-events-none">Drag to rotate</p>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-white/50 text-sm mb-1">Galaxy Ring</p>
          <p className="text-3xl lg:text-4xl font-semibold mb-6">{finish.name}</p>
          <p className="sg-eyebrow !text-[0.65rem] mb-3">Finish</p>
          <div className="flex gap-3 mb-3" role="radiogroup" aria-label="Finish">
            {FINISHES.map((c) => (
              <button
                key={c.id}
                role="radio"
                aria-checked={c.id === finish.id}
                aria-label={c.name}
                title={c.name}
                onClick={() => setFinish(c.id)}
                className={`w-11 h-11 rounded-full border transition-transform ${
                  c.id === finish.id ? 'border-white scale-110 ring-2 ring-white/40 ring-offset-2 ring-offset-black' : 'border-white/25'
                }`}
                style={{ background: c.swatch }}
              />
            ))}
          </div>
          <p className="mb-8 text-xs text-white/40">The finish also sets the color of this page.</p>
          <div className="flex items-end justify-between border-t border-white/10 pt-5">
            <div>
              <p className="text-white/50 text-sm">Price</p>
              <p className="text-3xl font-semibold tabular-nums">{PRICE}</p>
            </div>
            <a href="#specs" className="sg-btn">
              Continue
            </a>
          </div>
          <p className="mt-4 text-[0.7rem] text-white/40">Samsung US list price at launch. No subscription needed for health features.</p>
        </div>
      </div>
    </section>
  );
}
