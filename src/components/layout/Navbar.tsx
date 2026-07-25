'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/feed', label: 'Feed' },
  { href: '/map', label: 'Map' },
  { href: '/rides', label: 'Rides' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()

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
          {user ? (
            <>
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

              <div className="flex items-center gap-3 border-l border-border pl-4">
                <button
                  onClick={toggle}
                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  )}
                </button>
                <Link href="/profile" className="hidden text-xs text-text-muted transition-colors hover:text-text-primary sm:block">
                  {user.email}
                </Link>
                <button
                  onClick={signOut}
                  className="rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/map"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/map'
                    ? 'text-cyan-accent'
                    : 'text-text-secondary hover:text-cyan-hover'
                }`}
              >
                Map
              </Link>

              <button
                onClick={toggle}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

              <Link
                href="/login"
                className="rounded-lg bg-cyan-accent px-3 py-1.5 text-xs font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
