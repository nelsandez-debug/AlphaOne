export function KpiCard({
  label,
  value,
  sublabel,
  progress,
  progressColor = "#2a78d6",
}: {
  label: string;
  value: string;
  sublabel: string;
  progress: number;
  progressColor?: string;
}) {
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: progressColor }} />
      </div>
    </div>
  );
}
