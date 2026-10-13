'use client';

import { useEffect } from 'react';
import { restoreFinish } from '@/lib/theme';
import Scene from '@/components/Scene';
import HeroGlow from '@/components/HeroGlow';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ScrollProgress';
import SectionDots from '@/components/SectionDots';
import HeadlineReveal from '@/components/HeadlineReveal';
import AmbientPause from '@/components/AmbientPause';
import FilmTour from '@/components/FilmTour';
import Hero from '@/components/Hero';
import StageSections from '@/components/StageSections';
import SizesSection from '@/components/SizesSection';
import SleepSection from '@/components/SleepSection';
import HealthSection from '@/components/HealthSection';
import GestureSection from '@/components/GestureSection';
import BatterySection from '@/components/BatterySection';
import ColorsSection from '@/components/ColorsSection';
import CompareSection from '@/components/CompareSection';
import EcosystemSection from '@/components/EcosystemSection';
import Specs from '@/components/Specs';

export default function Home() {
  useEffect(() => {
    restoreFinish();
  }, []);

  return (
    <>
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-black focus:font-semibold"
      >
        Skip to content
      </a>
      <Navbar />
      <ScrollProgress />
      <SectionDots />
      <HeadlineReveal />
      <AmbientPause />
      <FilmTour />

      <main id="stage" className="relative w-full bg-[#030303]">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <HeroGlow />
          <Scene />
        </div>
        <div className="relative z-10">
          <Hero />
          <StageSections />
        </div>
      </main>

      <SizesSection />
      <SleepSection />
      <HealthSection />
      <GestureSection />
      <BatterySection />
      <ColorsSection />
      <CompareSection />
      <EcosystemSection />
      <Specs />
    </>
  );
}
