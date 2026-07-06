'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    question: 'What is Sipat?',
    answer:
      'Sipat is a road hazard intelligence platform for the Philippines. It uses AI to detect potholes and road anomalies from ride recordings, and combines that with community reports to create a real-time hazard map.',
  },
  {
    question: 'How does the AI detection work?',
    answer:
      'When you record a ride with the Sipat mobile app, the video is processed by our ML pipeline. It analyzes the footage frame by frame to identify potholes, cracks, and other road surface issues. Each detection is geotagged and severity-rated.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      "To report hazards, you'll need the Sipat mobile app. But anyone can view the live hazard map at sipat.app/map without an account.",
  },
  {
    question: 'How accurate is the detection?',
    answer:
      'Our ML model is trained on Philippine road conditions. It achieves high precision on moderate-to-severe hazards. Community verification helps filter false positives and track hazard status over time.',
  },
  {
    question: 'Can I verify hazards reported by others?',
    answer:
      "Yes. Once you have an account, you can mark hazards as 'Still here' or 'Fixed' and leave comments. This crowdsourced verification keeps the data accurate.",
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Ride recordings are processed on our servers and only hazard detections are stored publicly. Your personal information and raw video files are never shared.',
  },
  {
    question: 'How do I get the app?',
    answer:
      'The Sipat mobile app is available for Android. Download it from the Google Play Store or visit sipat.app/download for the APK.',
  },
  {
    question: 'Which areas are covered?',
    answer:
      'Currently focused on Metro Manila and surrounding provinces. We\'re expanding to more areas as more contributors join. Check the live map for current coverage.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
          Common questions
        </h2>

        <div className="mt-12">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="border-b border-border">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="text-sm font-semibold text-text-primary">
                    {item.question}
                  </span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm leading-relaxed text-text-secondary">
                    {item.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-sm text-text-secondary">
          Still have questions?{' '}
          <a
            href="mailto:hello@sipat.app"
            className="text-cyan-accent hover:text-cyan-hover"
          >
            Contact us
          </a>
        </p>
      </div>
    </section>
  )
}
