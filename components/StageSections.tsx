const DESIGN_STATS = [
  { value: '2.3', unit: 'g', label: 'from, size 5' },
  { value: '7', unit: 'mm', label: 'wide' },
  { value: '2.6', unit: 'mm', label: 'thin' },
];

const SENSORS = ['Optical heart rate (PPG)', 'Skin temperature', 'Accelerometer'];

export default function StageSections() {
  return (
    <>
      <section id="design" className="relative h-[220svh]">
        <div className="sticky top-0 h-svh flex items-start lg:items-center px-6 lg:px-[8%] pt-24 lg:pt-0">
          <div className="max-w-md">
            <p className="sg-eyebrow mb-3 lg:mb-5">Design</p>
            <h2 className="sg-title">
              Titanium, <strong>barely there.</strong>
            </h2>
            <p className="sg-lead mt-4 lg:mt-6 max-lg:hidden">
              A titanium frame with a concave outer face, so it stays comfortable on your finger day and night. No
              screen, no buttons, nothing to charge every evening.
            </p>
            <div className="mt-6 hidden lg:flex gap-8">
              {DESIGN_STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-semibold tabular-nums">
                    {s.value}
                    <span className="text-base text-white/50"> {s.unit}</span>
                  </p>
                  <p className="text-xs text-white/50 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="inside" className="relative h-[220svh]">
        <div className="sticky top-0 h-svh flex items-start lg:items-center px-6 lg:px-[8%] pt-24 lg:pt-0">
          <div className="max-w-md">
            <p className="sg-eyebrow mb-3 lg:mb-5">Sensors</p>
            <h2 className="sg-title">
              Small outside. <strong>Smart inside.</strong>
            </h2>
            <p className="sg-lead mt-4 lg:mt-6 max-lg:hidden">
              Sensors sit right against your skin, where readings are steady. They follow your heart rate, HRV, blood
              oxygen, breathing rate and skin temperature, even while you sleep.
            </p>
            <ul className="mt-6 hidden lg:flex flex-wrap gap-2">
              {SENSORS.map((s) => (
                <li key={s} className="rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs text-white/75">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="case" className="relative h-[260svh]">
        <div className="sticky top-0 h-svh flex items-start lg:items-center px-6 lg:px-[8%] pt-24 lg:pt-0">
          <div className="max-w-md">
            <p className="sg-eyebrow mb-3 lg:mb-5">Charging case</p>
            <h2 className="sg-title">
              A case as clear <strong>as its purpose.</strong>
            </h2>
            <p className="sg-lead mt-4 lg:mt-6 max-lg:hidden">
              Drop the ring onto the charger, close the clear lid and it tops up. A light on the case shows the
              charge, and the case itself carries extra power when you travel.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
