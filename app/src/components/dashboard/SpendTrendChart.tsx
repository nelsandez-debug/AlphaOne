"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency } from "@/lib/labels";
import type { MonthlySpend } from "@/lib/forecast";

// Reference palette categorical slot 1 (blue) — validated colorblind-safe via
// dataviz skill's validate_palette.js. A single series needs no legend (the
// chart title names it) per the skill's non-negotiables.
const LINE_COLOR = "#2a78d6";

function monthLabel(month: string): string {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function SpendTrendChart({ monthly, avgMonthlyRunRate }: { monthly: MonthlySpend[]; avgMonthlyRunRate: number }) {
  const data = monthly.map((m) => ({ ...m, label: monthLabel(m.month) }));

  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatCompactCurrency(v)}
              width={56}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Actual spend"]}
              labelStyle={{ color: "#0f172a", fontWeight: 500 }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            {avgMonthlyRunRate > 0 && (
              <ReferenceLine
                y={avgMonthlyRunRate}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: `Avg. monthly run-rate (${formatCompactCurrency(avgMonthlyRunRate)})`,
                  fontSize: 11,
                  fill: "#64748b",
                  position: "insideTopRight",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="amount"
              stroke={LINE_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: LINE_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">View as table</summary>
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-1 font-medium">Month</th>
              <th className="py-1 font-medium">Actual spend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.month} className="border-t border-slate-100">
                <td className="py-1 text-slate-600">{m.label}</td>
                <td className="py-1 text-slate-600">${m.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
