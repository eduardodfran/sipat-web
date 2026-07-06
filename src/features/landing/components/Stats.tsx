'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function Stats() {
  const [hazards, setHazards] = useState<number | null>(null);
  const [rides, setRides] = useState<number | null>(null);
  const [potholes, setPotholes] = useState<{ severity: string }[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const [hazardsRes, ridesRes, potholesRes] = await Promise.all([
        supabase.from('v_unified_potholes').select('*', { count: 'exact', head: true }),
        supabase.from('rides_metadata').select('*', { count: 'exact', head: true }),
        supabase.from('v_unified_potholes').select('severity'),
      ]);

      if (hazardsRes.count != null) setHazards(hazardsRes.count);
      if (ridesRes.count != null) setRides(ridesRes.count);
      if (potholesRes.data) setPotholes(potholesRes.data);
    };

    fetchCounts();
  }, []);

  const format = (n: number | null) => (n != null ? n.toLocaleString() : '—');

  const severeCount = potholes.filter((p) => p.severity === 'severe').length;
  const moderateCount = potholes.filter((p) => p.severity === 'moderate').length;
  const minorCount = potholes.filter((p) => p.severity === 'minor').length;

  const cells = [
    { value: format(hazards), label: 'Hazards', trend: '↑ 12%', trendColor: 'text-green-safe' },
    { value: format(rides), label: 'Rides', trend: '↑ 8%', trendColor: 'text-green-safe' },
    { value: '12', label: 'Areas', trend: null, trendColor: null },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <p className="text-text-muted mb-3 text-xs">Last 30 days</p>
        <div className="bg-border flex w-full gap-px">
      {cells.map((cell, i) => (
        <div key={i} className="bg-asphalt flex flex-1 flex-col items-center gap-1 py-6">
          <div className="flex items-start gap-1">
            <span className="text-text-primary font-mono text-3xl font-bold tabular-nums">
              {cell.value}
            </span>
            {cell.trend && (
              <span className={`mt-1 text-[10px] font-medium ${cell.trendColor}`}>
                {cell.trend}
              </span>
            )}
          </div>
          <span className="text-text-muted text-[10px] font-semibold uppercase tracking-widest">
            {cell.label}
          </span>
        </div>
      ))}
        </div>
        <div className="bg-asphalt mt-px flex items-center gap-2 border-t border-border px-6 py-3">
          <span className="text-text-muted text-xs">
            Severe: {severeCount} • Moderate: {moderateCount} • Minor: {minorCount}
          </span>
        </div>
      </div>
    </section>
  );
}
