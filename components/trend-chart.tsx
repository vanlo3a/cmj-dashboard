"use client"

import { formatDate, type JumpSession } from "@/lib/cmj-data"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface TrendChartProps {
  title: string
  subtitle: string
  sessions: JumpSession[]
  dataKey: keyof JumpSession
  unit: string
  colorVar: string
  gradientId: string
}

interface TooltipPayload {
  active?: boolean
  payload?: { payload: JumpSession }[]
  unit: string
  dataKey: keyof JumpSession
}

function ChartTooltip({ active, payload, unit, dataKey }: TooltipPayload) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const value = point[dataKey] as number
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{formatDate(point.date)}</p>
      <p className="mt-0.5 text-sm font-semibold text-popover-foreground tabular-nums">
        {value.toLocaleString("en-US")}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

export function TrendChart({
  title,
  subtitle,
  sessions,
  dataKey,
  unit,
  colorVar,
  gradientId,
}: TrendChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: `var(${colorVar})` }}
          />
          {unit || "index"}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sessions} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(${colorVar})`} stopOpacity={0.35} />
                <stop offset="100%" stopColor={`var(${colorVar})`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} dataKey={dataKey} />}
              cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={`var(${colorVar})`}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
