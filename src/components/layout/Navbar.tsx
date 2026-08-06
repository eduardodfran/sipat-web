'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/feed', label: 'Feed' },
  { href: '/map', label: 'Map' },
  { href: '/rides', label: 'Rides' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src={theme === 'dark' ? '/sipat-dark.png' : '/sipat-light.png'}
            alt="Sipat Logo"
            className="h-9 w-auto"
          />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight text-text-primary">Sipat</h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              Road Hazard Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 lg:flex lg:gap-4">
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
                <span className="hidden xl:inline">Report Hazard</span>
              </Link>

              <Link
                href="/search"
                className={`rounded-lg p-2 transition-colors ${
                  pathname === '/search'
                    ? 'text-cyan-accent bg-cyan-dim'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </Link>

              <div className="flex items-center gap-2 border-l border-border pl-3 lg:gap-3 lg:pl-4">
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
                <Link href="/profile" className="hidden text-xs text-text-muted transition-colors hover:text-text-primary xl:inline">
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

              <Link
                href="/about"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/about'
                    ? 'text-cyan-accent'
                    : 'text-text-secondary hover:text-cyan-hover'
                }`}
              >
                About
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

        {/* Mobile hamburger + theme toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggle}
            className="rounded-lg p-2.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-asphalt px-4 py-4 lg:hidden">
          {user ? (
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-cyan-dim text-cyan-accent'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/search"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === '/search'
                    ? 'bg-cyan-dim text-cyan-accent'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Search
              </Link>

              <Link
                href="/map"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-cyan-accent px-3 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Report Hazard
              </Link>

              <div className="mt-3 border-t border-border pt-3">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  {user.email}
                </Link>
                <button
                  onClick={() => { signOut(); setMenuOpen(false) }}
                  className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-hazard transition-colors hover:bg-surface-hover"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Link
                href="/map"
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === '/map'
                    ? 'bg-cyan-dim text-cyan-accent'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                Map
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === '/about'
                    ? 'bg-cyan-dim text-cyan-accent'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                About
              </Link>
              <Link
                href="/search"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === '/search'
                    ? 'bg-cyan-dim text-cyan-accent'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Search
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center rounded-lg bg-cyan-accent px-3 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
