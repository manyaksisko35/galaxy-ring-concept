import Image from 'next/image';
import { BUDS_SITE, S26_SITE, WATCH_SITE } from '@/lib/links';

const SITES = [
  {
    href: S26_SITE,
    img: '/ecosystem/s26-product.webp',
    name: 'Galaxy S26 Ultra',
    text: 'Double pinch to take the shot.',
    glow: 'radial-gradient(60% 65% at 50% 55%, rgba(125, 211, 252, 0.2), rgba(167, 139, 250, 0.08) 55%, transparent 75%)',
  },
  {
    href: BUDS_SITE,
    img: '/ecosystem/buds4-pro-product.webp',
    name: 'Galaxy Buds4 Pro',
    text: 'Hi-Fi sound for the walk your ring is counting.',
    glow: 'radial-gradient(55% 60% at 50% 55%, rgba(210, 222, 240, 0.18), transparent 72%)',
  },
  {
    href: WATCH_SITE,
    img: '/ecosystem/watch-ultra2-product.webp',
    name: 'Galaxy Watch Ultra2',
    text: 'Wear both for longer battery and richer data.',
    glow: 'radial-gradient(55% 60% at 50% 55%, rgba(164, 185, 140, 0.24), transparent 72%)',
  },
];

const PERKS = [
  { title: 'Find My Ring', text: 'See where your ring was last connected from your Galaxy phone.' },
  { title: 'Camera control', text: 'Double pinch to take a photo on your Galaxy phone.' },
  { title: 'Better with a watch', text: 'Wear both and the ring can save power while the watch tracks.' },
];

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="sg-ambient amb-violet relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto">
        <p className="sg-eyebrow mb-3 lg:mb-5">Galaxy ecosystem</p>
        <h2 className="sg-title max-w-3xl">
          Better <strong className="sg-ai">together.</strong>
        </h2>
        <div className="mt-10 lg:mt-14 grid md:grid-cols-3 gap-4 lg:gap-6">
          {SITES.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0d] transition-colors duration-300 hover:border-white/25"
            >
              <div className="relative aspect-[16/10]" style={{ background: s.glow }}>
                <Image
                  src={s.img}
                  alt={s.name}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-contain p-6 lg:p-8 transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-end justify-between gap-4 px-5 pb-5 lg:px-7 lg:pb-7">
                <div>
                  <p className="sg-eyebrow !text-[0.6rem] mb-1">Concept</p>
                  <p className="text-xl lg:text-2xl font-semibold">{s.name}</p>
                  <p className="text-sm text-white/60 font-light mt-1">{s.text}</p>
                </div>
                <span className="sg-btn !py-2.5 !px-5 text-sm shrink-0">
                  Explore
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                    <path d="M3 9L9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-4 lg:mt-6 grid md:grid-cols-3 gap-3">
          {PERKS.map((p) => (
            <div key={p.title} className="sg-card !rounded-2xl px-5 py-4">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-white/55 font-light mt-1">{p.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-4">Feature availability depends on device and software version.</p>
      </div>
    </section>
  );
}
