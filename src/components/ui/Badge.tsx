import type { Severity } from '@/lib/types'

const SEVERITY_STYLES: Record<Severity, string> = {
  Severe: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  Moderate: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30',
  Minor: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
  Unknown: 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30',
}

const SEVERITY_DOTS: Record<Severity, string> = {
  Severe: 'bg-red-400',
  Moderate: 'bg-yellow-400',
  Minor: 'bg-green-400',
  Unknown: 'bg-gray-400',
}

export function Badge({
  severity,
  size = 'sm',
}: {
  severity: Severity
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2 py-0.5 text-[11px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${SEVERITY_STYLES[severity]} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOTS[severity]}`} />
      {severity}
    </span>
  )
}
