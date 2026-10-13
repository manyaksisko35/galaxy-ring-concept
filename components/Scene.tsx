'use client';

import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Html, PerformanceMonitor } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/useReducedMotion';
import { RimLight, StudioEnv } from '@/components/StudioEnv';
import { applyFinish, poseRig, useRingRig, type CasePose, type Pose, type Rig } from '@/lib/ringRig';
import { useFinish } from '@/lib/theme';
import { heroSpin, stepSpin } from '@/lib/dragSpin';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

type Stage = {
  ring: Pose;
  box: CasePose;
  hotA: number;
  hotB: number;
};

type Key = 'hero' | 'design' | 'inside' | 'case' | 'closed';

const HIDDEN_CASE: CasePose = { x: 0.85, y: -0.45, s: 0.55, rx: 0.45, ry: -0.6, rz: 0, lid: 1.85, show: 0, seat: 0 };

const DESKTOP: Record<Key, Stage> = {
  hero: { ring: { x: 0, y: -0.35, s: 1.05, rx: 1.15, ry: 0.4, rz: 0.3 }, box: HIDDEN_CASE, hotA: 0, hotB: 0 },
  design: { ring: { x: 0.85, y: -0.05, s: 1.45, rx: 0.32, ry: 0.65, rz: -0.18 }, box: HIDDEN_CASE, hotA: 1, hotB: 0 },
  inside: { ring: { x: 0.85, y: -0.05, s: 1.65, rx: 0.95, ry: 1.95, rz: 0.05 }, box: HIDDEN_CASE, hotA: 0, hotB: 1 },
  case: { ring: { x: 0.8, y: 0.6, s: 1.1, rx: 0.42, ry: 0, rz: 0 }, box: { ...HIDDEN_CASE, show: 1, seat: 1 }, hotA: 0, hotB: 0 },
  closed: { ring: { x: 0.8, y: 0.6, s: 1.1, rx: 0.42, ry: 0, rz: 0 }, box: { ...HIDDEN_CASE, show: 1, seat: 1, lid: 0, ry: -0.75 }, hotA: 0, hotB: 0 },
};

const M_CASE: CasePose = { x: 0, y: -0.85, s: 0.36, rx: 0.45, ry: -0.6, rz: 0, lid: 1.85, show: 0, seat: 0 };

const MOBILE: typeof DESKTOP = {
  hero: { ring: { x: 0, y: -0.45, s: 0.75, rx: 1.15, ry: 0.4, rz: 0.3 }, box: M_CASE, hotA: 0, hotB: 0 },
  design: { ring: { x: 0.18, y: -0.6, s: 0.62, rx: 0.32, ry: 0.65, rz: -0.18 }, box: M_CASE, hotA: 1, hotB: 0 },
  inside: { ring: { x: 0, y: -0.6, s: 0.72, rx: 0.95, ry: 1.95, rz: 0.05 }, box: M_CASE, hotA: 0, hotB: 1 },
  case: { ring: { x: 0, y: 0, s: 0.6, rx: 0.42, ry: 0, rz: 0 }, box: { ...M_CASE, show: 1, seat: 1 }, hotA: 0, hotB: 0 },
  closed: { ring: { x: 0, y: 0, s: 0.6, rx: 0.42, ry: 0, rz: 0 }, box: { ...M_CASE, show: 1, seat: 1, lid: 0, ry: -0.75 }, hotA: 0, hotB: 0 },
};

const clone = (s: Stage): Stage => ({ ring: { ...s.ring }, box: { ...s.box }, hotA: s.hotA, hotB: s.hotB });
const stage: Stage = clone(DESKTOP.hero);

const HOTSPOTS = [
  { key: 'titanium', group: 'hotA', title: 'Titanium frame', text: 'Light and tough, from 2.3 g.' },
  { key: 'concave', group: 'hotA', title: 'Concave design', text: 'Shaped to sit comfortably all day and night.' },
  { key: 'sensor', group: 'hotB', title: 'Optical sensors', text: 'Heart rate, HRV and blood oxygen.' },
  { key: 'temp', group: 'hotB', title: 'Skin temperature', text: 'Tracks overnight changes for sleep and cycle insights.' },
] as const;

function Hotspots({ rig }: { rig: Rig }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useFrame(() => {
    const seen = { hotA: 0, hotB: 0 };
    HOTSPOTS.forEach((h, i) => {
      const el = refs.current[i];
      if (!el) return;
      const k = Math.min(1, Math.max(0, stage[h.group] * 3 - seen[h.group]++ * 0.6));
      el.style.opacity = String(k);
      el.style.transform = `translateY(${(1 - k) * 10}px)`;
      el.style.visibility = k <= 0.01 ? 'hidden' : 'visible';
    });
  });

  return createPortal(
    <>
      {HOTSPOTS.map((h, i) => (
        <Html key={h.key} position={rig.ring.anchors[h.key]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="hotspot"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <span className="hotspot__dot" />
            <span className="hotspot__line" />
            <span className="hotspot__card">
              <strong>{h.title}</strong>
              <em>{h.text}</em>
            </span>
          </div>
        </Html>
      ))}
    </>,
    rig.ring.root
  );
}

function Ring() {
  const rig = useRingRig();
  const finish = useFinish();
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const ringPose = useRef<Pose>({ ...DESKTOP.hero.ring });

  useEffect(() => {
    document.documentElement.dataset.loaded = '1';
  }, []);

  useEffect(() => {
    applyFinish(rig, finish);
  }, [rig, finish]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    stepSpin(heroSpin, dt);
    const t = state.clock.elapsedTime;
    const heroK = Math.max(0, 1 - stage.hotA - stage.hotB - stage.box.show);
    const r = ringPose.current;
    Object.assign(r, stage.ring);
    r.y += reduce ? 0 : Math.sin(t * 1.1) * 0.025;
    r.rx += heroSpin.pitch;
    r.ry += heroSpin.yaw + (reduce ? 0 : Math.sin(t * 0.45) * 0.6 * heroK);
    poseRig(rig, r, stage.box);
  });

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const build = (P: typeof DESKTOP) => {
      const reset = (s: Stage) => {
        Object.assign(stage.ring, s.ring);
        Object.assign(stage.box, s.box);
        stage.hotA = s.hotA;
        stage.hotB = s.hotB;
      };
      reset(P.hero);
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'power2.inOut' },
        scrollTrigger: { trigger: '#stage', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true },
      });
      const to = (key: Key, at: number, duration = 1) => {
        tl.to(stage.ring, { ...P[key].ring, duration }, at).to(stage.box, { ...P[key].box, duration }, at);
      };
      // one timeline unit = 100svh of scroll, so beats line up with the sticky sections
      to('design', 0);
      tl.to(stage, { hotA: 1, duration: 0.5 }, 1.2).to(stage, { hotA: 0, duration: 0.3 }, 2.6);
      to('inside', 2.9, 1.0);
      tl.to(stage, { hotB: 1, duration: 0.5 }, 4.0).to(stage, { hotB: 0, duration: 0.3 }, 5.0);
      to('case', 5.2, 1.0);
      to('closed', 6.3, 0.6);
      tl.to({ idle: 0 }, { idle: 1, duration: 0.1 }, 6.9);
    };
    mm.add('(min-width: 1024px)', () => build(DESKTOP));
    mm.add('(max-width: 1023px)', () => build(MOBILE));
    return () => mm.revert();
  }, []);

  return (
    <>
      <primitive object={rig.ringPivot} />
      <primitive object={rig.casePivot} />
      <Hotspots rig={rig} />
    </>
  );
}

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: prefersReducedMotion() ? 1 : 0.1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState(1.25);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = document.getElementById('stage');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <SmoothScroll />
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 6], fov: 30 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))} />
        <CameraRig />
        <StudioEnv intensity={1} />
        <RimLight />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 4]} intensity={2} />
        <directionalLight position={[-4, -2, -3]} intensity={1.0} color="#e6ecf5" />
        <Suspense fallback={null}>
          <Ring />
        </Suspense>
      </Canvas>
    </>
  );
}
