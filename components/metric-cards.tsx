"use client"

import { cn } from "@/lib/utils"
import type { MetricSummary } from "@/lib/cmj-data"
import { ArrowDownRight, ArrowUpRight, Gauge, Ruler, TrendingUp, Zap } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"

const ICONS: Record<string, typeof Ruler> = {
  "Jump Height": Ruler,
  "Peak Force": Gauge,
  "Peak Power": Zap,
  "RSI Modified": TrendingUp,
}

interface MetricCardsProps {
  metrics: MetricSummary[]
  sparklines: Record<string, number[]>
}

export function MetricCards({ metrics, sparklines }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = ICONS[metric.label] ?? Ruler
        const delta = metric.value - metric.previous
        const pct = metric.previous !== 0 ? (delta / metric.previous) * 100 : 0
        const positive = delta >= 0
        const spark = (sparklines[metric.label] ?? []).map((v, i) => ({ i, v }))

        return (
          <div
            key={metric.label}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="size-[18px]" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
              </div>
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  positive
                    ? "bg-emerald-500/12 text-emerald-400"
                    : "bg-rose-500/12 text-rose-400",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(pct).toFixed(1)}%
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {metric.value.toLocaleString("en-US", {
                    minimumFractionDigits: metric.precision,
                    maximumFractionDigits: metric.precision,
                  })}
                  {metric.unit && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  vs {metric.previous.toLocaleString("en-US", {
                    minimumFractionDigits: metric.precision,
                    maximumFractionDigits: metric.precision,
                  })}{" "}
                  last session
                </p>
              </div>

              <div className="h-10 w-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id={`spark-${metric.label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill={`url(#spark-${metric.label})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
