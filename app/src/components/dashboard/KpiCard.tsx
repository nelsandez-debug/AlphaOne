export function KpiCard({
  label,
  value,
  sublabel,
  progress,
  progressColor = "#597ea3",
}: {
  label: string;
  value: string;
  sublabel: string;
  progress: number;
  progressColor?: string;
}) {
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div className="glass p-5">
      <p className="text-[10px] tracking-[0.1em] text-accent-700 uppercase">{label}</p>
      <p className="font-heading mt-1 text-[34px] leading-none">{value}</p>
      <p className="mt-1.5 text-xs text-neutral-600">{sublabel}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: progressColor }} />
      </div>
    </div>
  );
}
