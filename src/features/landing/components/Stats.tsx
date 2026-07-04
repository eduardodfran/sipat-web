'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function Stats() {
  const [hazards, setHazards] = useState<number | null>(null);
  const [rides, setRides] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      const [hazardsRes, ridesRes] = await Promise.all([
        supabase.from('v_unified_potholes').select('*', { count: 'exact', head: true }),
        supabase.from('rides_metadata').select('*', { count: 'exact', head: true }),
      ]);

      if (hazardsRes.count != null) setHazards(hazardsRes.count);
      if (ridesRes.count != null) setRides(ridesRes.count);
    };

    fetchCounts();
  }, []);

  const format = (n: number | null) => (n != null ? n.toLocaleString() : '—');

  const cells = [
    { value: format(hazards), label: 'Hazards' },
    { value: format(rides), label: 'Rides' },
    { value: '12', label: 'Areas' },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="bg-border flex w-full gap-px">
      {cells.map((cell, i) => (
        <div key={i} className="bg-asphalt flex flex-1 flex-col items-center gap-1 py-6">
          <span className="text-text-primary font-mono text-3xl font-bold tabular-nums">
            {cell.value}
          </span>
          <span className="text-text-muted text-[10px] font-semibold uppercase tracking-widest">
            {cell.label}
          </span>
        </div>
      ))}
        </div>
      </div>
    </section>
  );
}
