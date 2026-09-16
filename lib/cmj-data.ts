export type Sport =
  | "Basketball"
  | "Volleyball"
  | "Soccer"
  | "Track & Field"
  | "Rugby"
  | "Football"

export interface JumpSession {
  /** ISO date string, e.g. "2026-03-14" */
  date: string
  /** Jump height in centimeters */
  jumpHeight: number
  /** Peak force in Newtons */
  peakForce: number
  /** Peak power in Watts */
  peakPower: number
  /** Reactive Strength Index (modified), unitless */
  rsiModified: number
}

export interface Athlete {
  id: string
  name: string
  sport: Sport
  position: string
  team: string
  bodyMass: number // kg
  status: "Active" | "Monitoring" | "Injured"
  sessions: JumpSession[]
}

export interface MetricSummary {
  label: string
  unit: string
  value: number
  previous: number
  /** Higher is better for all CMJ metrics here */
  precision: number
}

/** Deterministic pseudo-random generator so mock data is stable between renders. */
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildSessions(
  seed: number,
  base: { jh: number; pf: number; pp: number; rsi: number },
  weeks = 16,
): JumpSession[] {
  const rand = seeded(seed)
  const sessions: JumpSession[] = []
  const start = new Date("2026-01-05T00:00:00Z")

  let jh = base.jh
  let pf = base.pf
  let pp = base.pp
  let rsi = base.rsi

  for (let i = 0; i < weeks; i++) {
    // gentle upward trend with weekly noise
    const trend = i * 0.18
    jh = base.jh + trend + (rand() - 0.45) * 2.4
    pf = base.pf + trend * 14 + (rand() - 0.45) * 90
    pp = base.pp + trend * 30 + (rand() - 0.45) * 180
    rsi = base.rsi + trend * 0.006 + (rand() - 0.45) * 0.04

    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i * 7)

    sessions.push({
      date: d.toISOString().slice(0, 10),
      jumpHeight: Number(jh.toFixed(1)),
      peakForce: Math.round(pf),
      peakPower: Math.round(pp),
      rsiModified: Number(rsi.toFixed(2)),
    })
  }
  return sessions
}

export const athletes: Athlete[] = [
  {
    id: "ath-001",
    name: "Marcus Chen",
    sport: "Basketball",
    position: "Guard",
    team: "Varsity A",
    bodyMass: 84,
    status: "Active",
    sessions: buildSessions(11, { jh: 42, pf: 2100, pp: 4900, rsi: 0.58 }),
  },
  {
    id: "ath-002",
    name: "Sofia Ramirez",
    sport: "Volleyball",
    position: "Outside Hitter",
    team: "Varsity A",
    bodyMass: 71,
    status: "Active",
    sessions: buildSessions(23, { jh: 38, pf: 1850, pp: 4300, rsi: 0.52 }),
  },
  {
    id: "ath-003",
    name: "Daniel Okafor",
    sport: "Track & Field",
    position: "Sprinter",
    team: "Elite Squad",
    bodyMass: 79,
    status: "Monitoring",
    sessions: buildSessions(37, { jh: 46, pf: 2350, pp: 5400, rsi: 0.64 }),
  },
  {
    id: "ath-004",
    name: "Emma Lindqvist",
    sport: "Soccer",
    position: "Midfielder",
    team: "Women's First",
    bodyMass: 63,
    status: "Active",
    sessions: buildSessions(53, { jh: 34, pf: 1620, pp: 3800, rsi: 0.47 }),
  },
  {
    id: "ath-005",
    name: "Tyrone Jackson",
    sport: "Football",
    position: "Running Back",
    team: "Varsity A",
    bodyMass: 96,
    status: "Injured",
    sessions: buildSessions(71, { jh: 40, pf: 2450, pp: 5100, rsi: 0.5 }),
  },
  {
    id: "ath-006",
    name: "Aiko Tanaka",
    sport: "Volleyball",
    position: "Setter",
    team: "Women's First",
    bodyMass: 66,
    status: "Active",
    sessions: buildSessions(89, { jh: 36, pf: 1740, pp: 4050, rsi: 0.49 }),
  },
  {
    id: "ath-007",
    name: "Liam O'Sullivan",
    sport: "Rugby",
    position: "Flanker",
    team: "Elite Squad",
    bodyMass: 102,
    status: "Monitoring",
    sessions: buildSessions(101, { jh: 33, pf: 2600, pp: 5300, rsi: 0.44 }),
  },
  {
    id: "ath-008",
    name: "Priya Nair",
    sport: "Basketball",
    position: "Forward",
    team: "Women's First",
    bodyMass: 74,
    status: "Active",
    sessions: buildSessions(127, { jh: 39, pf: 1900, pp: 4400, rsi: 0.55 }),
  },
]

export function getLatest(athlete: Athlete): JumpSession {
  return athlete.sessions[athlete.sessions.length - 1]
}

export function getPrevious(athlete: Athlete): JumpSession {
  const n = athlete.sessions.length
  return athlete.sessions[Math.max(0, n - 2)]
}

export function buildMetricSummaries(athlete: Athlete): MetricSummary[] {
  const latest = getLatest(athlete)
  const previous = getPrevious(athlete)
  return [
    {
      label: "Jump Height",
      unit: "cm",
      value: latest.jumpHeight,
      previous: previous.jumpHeight,
      precision: 1,
    },
    {
      label: "Peak Force",
      unit: "N",
      value: latest.peakForce,
      previous: previous.peakForce,
      precision: 0,
    },
    {
      label: "Peak Power",
      unit: "W",
      value: latest.peakPower,
      previous: previous.peakPower,
      precision: 0,
    },
    {
      label: "RSI Modified",
      unit: "",
      value: latest.rsiModified,
      previous: previous.rsiModified,
      precision: 2,
    },
  ]
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z")
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}
