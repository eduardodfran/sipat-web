import type { DashboardStats } from '@/lib/types'

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#13133a] px-5 py-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
      </div>
    </div>
  )
}

export function AnalyticsBanner({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total Hazards"
        value={stats.totalPotholes}
        color="bg-blue-500/15"
        icon={
          <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
      />
      <StatCard
        label="Severe"
        value={stats.severeCount}
        color="bg-red-500/15"
        icon={
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
      />
      <StatCard
        label="Moderate"
        value={stats.moderateCount}
        color="bg-yellow-500/15"
        icon={
          <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
      />
      <StatCard
        label="Minor"
        value={stats.minorCount}
        color="bg-green-500/15"
        icon={
          <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  )
}
