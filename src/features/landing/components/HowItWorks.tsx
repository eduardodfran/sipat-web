import { FadeIn } from '@/components/ui/FadeIn'

const steps = [
  {
    number: "01",
    title: "Record your ride",
    description:
      "Open the Sipat app and hit record. The app auto-segments your ride into 5-minute chunks, capturing video and GPS data.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      </svg>
    ),
    barColor: 'bg-cyan-accent',
  },
  {
    number: "02",
    title: "AI detects hazards",
    description:
      "Each segment is uploaded and processed by our YOLOv8 ML pipeline. Potholes and road anomalies are detected, geotagged, and severity-rated.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
        <path d="M18 16l.75 2.25L21 19l-2.25.75L18 22l-.75-2.25L15 19l2.25-.75z" />
        <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z" />
      </svg>
    ),
    barColor: 'bg-green-safe',
  },
  {
    number: "03",
    title: "Hazards appear on map",
    description:
      "Detections are plotted on the live hazard map with severity ratings. Community members can submit photos and verify reported hazards.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    barColor: 'bg-amber-warn',
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black text-text-primary">
            Three steps to safer roads
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            2 min to set up &bull; No coding required
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 120}>
              <div className="bg-surface rounded-xl overflow-hidden border border-border">
                {/* Colored header bar */}
                <div className={`${step.barColor} px-5 py-3 flex items-center justify-between`}>
                  <span className="text-sm font-bold text-white/90">Step {step.number}</span>
                  <span className="text-white/60">{step.icon}</span>
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={400}>
          <p className="mt-8 text-center text-sm text-text-muted">
            Just hit record — our AI handles the rest.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
