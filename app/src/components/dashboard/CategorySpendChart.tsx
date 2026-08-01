"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency } from "@/lib/labels";
import type { CategorySpend } from "@/lib/analytics";

// One nominal dimension (category), no natural order beyond magnitude, so this
// stays a single hue for every bar rather than a value-ramp or a categorical
// rainbow — a per-category hue would double-encode magnitude that bar length
// already shows (dataviz skill anti-pattern: "value-ramp on nominal categories").
// A donut was the mockup's original idea, but the skill flags donut/pie as an
// anti-pattern for comparing close values — a sorted single-hue bar reads more
// accurately and still shows part-to-whole via each bar's share of the total.
const BAR_COLOR = "#2a78d6";

export function CategorySpendChart({ categorySpend }: { categorySpend: CategorySpend[] }) {
  const data = [...categorySpend].sort((a, b) => b.amount - a.amount);
  const height = Math.max(160, data.length * 40);

  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactCurrency(v)} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} width={130} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Spend"]}
              labelStyle={{ color: "#0f172a", fontWeight: 500 }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((d) => (
                <Cell key={d.category} fill={BAR_COLOR} />
              ))}
              <LabelList dataKey="amount" position="right" formatter={(v) => formatCompactCurrency(Number(v))} style={{ fontSize: 11, fill: "#475569" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">View as table</summary>
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-1 font-medium">Category</th>
              <th className="py-1 font-medium">Spend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.category} className="border-t border-slate-100">
                <td className="py-1 text-slate-600">{d.category}</td>
                <td className="py-1 text-slate-600">${d.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
