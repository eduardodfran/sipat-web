'use client'

import { useState } from 'react'
import { FadeIn } from '@/components/ui/FadeIn'

const FAQ_ITEMS = [
  {
    question: 'What is Sipat?',
    answer:
      'Sipat is a road hazard intelligence platform for the Philippines. It uses AI to detect potholes and road anomalies from ride recordings, and combines that with community photo reports to create a real-time hazard map.',
  },
  {
    question: 'How does the AI detection work?',
    answer:
      'When you record a ride with the Sipat mobile app, the video is automatically split into 5-minute chunks and uploaded. Each chunk is analyzed by our AI system, which scans footage for potholes and road damage. Each detection is located and rated by severity.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      "To report hazards, you'll need the Sipat mobile app (Android). But anyone can view the live hazard map and community reports at sipat.app without an account.",
  },
  {
    question: 'How accurate is the detection?',
    answer:
      'Our AI model is trained on Philippine road conditions. It achieves good precision on moderate-to-severe hazards. Community verification and photo submissions help filter false positives and track hazard status over time.',
  },
  {
    question: 'Can I verify hazards reported by others?',
    answer:
      "Yes. Once you have an account, you can submit photos of hazards and mark them as 'Still here' or 'Fixed'. This crowdsourced verification keeps the data accurate.",
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Ride recordings are processed on our Azure cloud servers and only hazard detections are stored publicly. Your personal information and raw video files are never shared.',
  },
  {
    question: 'How do I get the app?',
    answer:
      'The Sipat mobile app is available for Android. Download it from the link below or contact us for assistance.',
  },
  {
    question: 'What technology does Sipat use?',
    answer:
      'Sipat is built with React Native (Expo) for the mobile app, Next.js for the web dashboard, FastAPI for the backend, YOLO (AI model) for detection, Supabase for the database, and hosted on Microsoft Azure.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Common questions
          </h2>
        </FadeIn>

        <div className="mt-12">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <FadeIn key={index} delay={index * 50}>
                <div className="border-b border-border">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between py-5 text-left group"
                  >
                    <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-cyan-accent' : 'text-text-primary group-hover:text-cyan-accent'}`}>
                      {item.question}
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-300 ${
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
                  <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                    <div>
                      <p className="pb-5 pl-3 border-l-2 border-cyan-accent/30 text-sm leading-relaxed text-text-secondary">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn delay={200}>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              Still have questions?{' '}
              <a
                href="mailto:franeduardo305@gmail.com"
                className="text-cyan-accent hover:text-cyan-hover"
              >
                Contact us
              </a>
            </p>
            <a
              href="https://expo.dev/accounts/eduardofran/projects/SipatApp/builds/5c72bfac-4261-4984-930e-5653529ac499"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download App
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
