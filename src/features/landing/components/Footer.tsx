import Link from 'next/link'

const NAV_LINKS = [
  { href: '/map', label: 'Map' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/login', label: 'Sign In' },
]

const RESOURCE_LINKS = [
  { href: '/rides', label: 'Rides' },
]

const DOWNLOAD_URL = 'https://expo.dev/accounts/eduardofran/projects/SipatApp/builds/865c880b-07aa-4423-8439-e40f63898e06'
const CONTACT_EMAIL = 'franeduardo305@gmail.com'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface relative">
      {/* Cyan accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-accent/40 to-transparent" />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/sipat-dark.png" alt="Sipat" className="h-6 w-auto light:hidden" />
              <img src="/sipat-light.png" alt="Sipat" className="h-6 w-auto hidden light:block" />
            </div>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-text-muted">
              Community-powered road safety. Record rides, detect potholes with AI, and help make roads safer for everyone.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-safe" />
              <span className="text-[10px] text-text-muted">System operational</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Navigation
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-text-secondary transition-colors hover:text-cyan-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Resources
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-text-secondary transition-colors hover:text-cyan-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Download App
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              <li>
                <a
                  href={DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-secondary transition-colors hover:text-cyan-accent"
                >
                  Android (APK)
                </a>
              </li>
            </ul>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Contact
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-xs text-text-secondary transition-colors hover:text-cyan-accent"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 sm:flex sm:items-center sm:justify-between">
          <p className="text-[10px] text-text-muted">
            &copy; 2026 Sipat. Built with React Native, Next.js, FastAPI, AI, Supabase &amp; Azure.
          </p>
          <div className="mt-2 flex items-center gap-4 sm:mt-0">
            <span className="text-[10px] text-text-muted">Map data &copy; OpenStreetMap</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
