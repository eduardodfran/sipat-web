const steps = [
  {
    number: "01",
    title: "Record your ride",
    description:
      "Use the Sipat mobile app to record your commute. Video and GPS data are captured automatically.",
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
  },
  {
    number: "02",
    title: "AI detects hazards",
    description:
      "Our ML pipeline analyzes ride footage to identify potholes, cracks, and road anomalies.",
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
  },
  {
    number: "03",
    title: "Hazards appear on map",
    description:
      "Detected hazards are plotted on the live map with severity ratings. Community members can verify and report.",
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
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-black text-text-primary">
          Three steps to safer roads
        </h2>

        <div className="mt-14 grid gap-px bg-border sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="bg-asphalt p-6">
              <span className="text-4xl font-black text-white/[0.06]">
                {step.number}
              </span>
              <div className="mt-4 text-cyan-accent">{step.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
