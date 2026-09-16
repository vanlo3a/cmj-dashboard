"use client"

import { cn } from "@/lib/utils"
import { getLatest, type Athlete } from "@/lib/cmj-data"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

interface AthleteTableProps {
  athletes: Athlete[]
  selectedId: string
  onSelect: (id: string) => void
  /** When true, renders as a compact card list. Used on the overview panel. */
  compact?: boolean
}

const STATUS_STYLES: Record<Athlete["status"], string> = {
  Active: "bg-emerald-500/12 text-emerald-400",
  Monitoring: "bg-amber-500/12 text-amber-400",
  Injured: "bg-rose-500/12 text-rose-400",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
}

export function AthleteTable({ athletes, selectedId, onSelect, compact }: AthleteTableProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return athletes
    return athletes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.sport.toLowerCase().includes(q) ||
        a.team.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q),
    )
  }, [athletes, query])

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Athlete Database</h3>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {athletes.length} athletes
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, sport, team…"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Athlete</th>
              <th className="px-4 py-3 font-medium">Sport</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th className="px-4 py-3 text-right font-medium">Jump (cm)</th>
              <th className="px-4 py-3 text-right font-medium">Peak Power (W)</th>
              <th className="px-4 py-3 text-right font-medium">RSI-mod</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const latest = getLatest(a)
              const isSelected = a.id === selectedId
              return (
                <tr
                  key={a.id}
                  onClick={() => onSelect(a.id)}
                  className={cn(
                    "cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/40",
                    isSelected && "bg-primary/8",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full text-xs font-semibold",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-foreground",
                        )}
                      >
                        {initials(a.name)}
                      </div>
                      <div className="leading-tight">
                        <p className="font-medium text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.sport}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.team}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                    {latest.jumpHeight.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {latest.peakPower.toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {latest.rsiModified.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[a.status],
                      )}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="divide-y divide-border md:hidden">
        {filtered.map((a) => {
          const latest = getLatest(a)
          const isSelected = a.id === selectedId
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(a.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40",
                  isSelected && "bg-primary/8",
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-foreground",
                  )}
                >
                  {initials(a.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">{a.name}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        STATUS_STYLES[a.status],
                      )}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.sport} · {a.team}
                  </p>
                  <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                    <span>
                      JH <span className="font-medium text-foreground">{latest.jumpHeight.toFixed(1)}</span>
                    </span>
                    <span>
                      RSI <span className="font-medium text-foreground">{latest.rsiModified.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
