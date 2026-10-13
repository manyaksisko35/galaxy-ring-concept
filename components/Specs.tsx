import { SPECS } from '@/lib/specs';

export default function Specs() {
  return (
    <section id="specs" className="relative z-10 bg-[#030303] px-6 lg:px-[8%] pt-24 lg:pt-32 pb-12">
      <div className="max-w-6xl mx-auto">
        <p className="sg-eyebrow mb-3 lg:mb-5">Specs</p>
        <h2 className="sg-title mb-10 lg:mb-16">
          Galaxy <strong>Ring</strong>
        </h2>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {SPECS.map((g) => (
            <div key={g.group}>
              <h3 className="text-lg font-semibold mb-3">{g.group}</h3>
              <dl className="divide-y divide-white/10 border-y border-white/10">
                {g.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[0.9fr_1.4fr] gap-4 py-3 text-sm">
                    <dt className="text-white/50 font-light">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-white/40 max-w-3xl">
          Specifications from Samsung&apos;s Galaxy Ring announcement and product pages. Some features need a
          compatible Galaxy phone.
        </p>

        <footer className="mt-20 lg:mt-28 pt-8 border-t border-white/10 flex flex-col gap-2 md:flex-row md:justify-between text-xs text-white/60">
          <span className="tracking-[0.3em]">SAMSUNG</span>
          <span className="md:text-right">
            Fan-made concept. Not affiliated with Samsung. Designed and built by Hasan Alp Güngör.
            <br />
            Ring and charging case modeled from scratch in code with three.js.
          </span>
        </footer>
      </div>
    </section>
  );
}
