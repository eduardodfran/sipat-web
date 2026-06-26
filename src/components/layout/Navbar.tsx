'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/map', label: 'Map' },
  { href: '/rides', label: 'Rides' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-dim">
            <svg
              className="h-5 w-5 text-cyan-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">Sipat</h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              Road Hazard Intelligence
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-cyan-accent'
                  : 'text-text-secondary hover:text-cyan-hover'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/map"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-accent px-3 py-1.5 text-xs font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Report Hazard
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <span className="hidden text-xs text-text-muted sm:block">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-cyan-accent px-3 py-1.5 text-xs font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
