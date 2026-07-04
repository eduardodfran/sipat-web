import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between sm:px-8">
        <div>
          <span className="text-sm font-bold text-text-primary">Sipat</span>
          <p className="mt-0.5 text-xs text-text-muted">Road Hazard Intelligence</p>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/map" className="text-xs text-text-muted transition-colors hover:text-text-secondary">
            Map
          </Link>
          <Link href="/dashboard" className="text-xs text-text-muted transition-colors hover:text-text-secondary">
            Dashboard
          </Link>
        </nav>

        <p className="text-xs text-text-muted">&copy; 2026</p>
      </div>
    </footer>
  )
}
