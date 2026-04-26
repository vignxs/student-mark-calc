"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Row = {
  id: string
  subject: string
  marks: string
}

type PresetId = "custom" | "class10" | "hs_science" | "hs_commerce" | "hs_arts"

const DEFAULT_SUBJECTS = [
  "Tamil",
  "English",
  "Mathematics",
  "Science",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Accountancy",
  "Business Maths",
  "Economics",
  "Commerce",
  "History",
  "Geography",
  "Political Science",
] satisfies string[]

const PRESETS: Record<PresetId, { label: string; subjects: string[]; maxPerSubject: "100" | "50" }> = {
  custom: { label: "Custom", subjects: ["Tamil", "English", "Mathematics"], maxPerSubject: "100" },
  class10: {
    label: "10th (SSLC)",
    subjects: ["Tamil", "English", "Mathematics", "Science", "Social Science"],
    maxPerSubject: "100",
  },
  hs_science: {
    label: "Higher Secondary (Science)",
    subjects: ["Tamil", "English", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
    maxPerSubject: "100",
  },
  hs_commerce: {
    label: "Higher Secondary (Commerce)",
    subjects: ["Tamil", "English", "Accountancy", "Business Maths", "Economics", "Commerce"],
    maxPerSubject: "100",
  },
  hs_arts: {
    label: "Higher Secondary (Arts)",
    subjects: ["Tamil", "English", "History", "Geography", "Political Science", "Economics"],
    maxPerSubject: "100",
  },
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function gradeFromPercentage(pct: number) {
  if (pct >= 90) return "O"
  if (pct >= 80) return "A+"
  if (pct >= 70) return "A"
  if (pct >= 60) return "B+"
  if (pct >= 50) return "B"
  if (pct >= 40) return "C"
  return "F"
}

function cgpaFromPercentage(pct: number) {
  // Common quick conversion: CGPA ≈ Percentage / 10 (cap 10.0)
  const v = pct / 10
  return Math.min(10, Math.max(0, v))
}

function safeRandomId() {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

function newRow(partial?: Partial<Row>): Row {
  return {
    id: safeRandomId(),
    subject: partial?.subject ?? "",
    marks: partial?.marks ?? "",
  }
}

export default function Page() {
  const [preset, setPreset] = React.useState<PresetId>("custom")
  const [maxPerSubject, setMaxPerSubject] = React.useState<"100" | "50">("100")
  const [allSubjects, setAllSubjects] = React.useState<string[]>(() => Array.from(new Set(DEFAULT_SUBJECTS)))
  const [newSubject, setNewSubject] = React.useState("")
  const [rows, setRows] = React.useState<Row[]>(() => [
    newRow({ subject: "Tamil" }),
    newRow({ subject: "English" }),
    newRow({ subject: "Mathematics" }),
    newRow({ subject: "Science" }),
    newRow({ subject: "Social Science" }),
  ])

  const max = maxPerSubject === "100" ? 100 : 50

  const parsedMarks = rows.map((r) => {
    const n = Number(r.marks)
    if (!Number.isFinite(n)) return 0
    return Math.min(max, Math.max(0, n))
  })

  const total = parsedMarks.reduce((a, b) => a + b, 0)
  const count = rows.length
  const avg = count > 0 ? total / count : 0
  const pct = count > 0 ? (total / (count * max)) * 100 : 0
  const cgpa = cgpaFromPercentage(pct)
  const grade = gradeFromPercentage(pct)

  const filledSubjects = new Set(rows.map((r) => r.subject).filter(Boolean))
  const subjectOptions = allSubjects.map((s) => ({
    value: s,
    label: s,
    disabled: filledSubjects.has(s),
  }))

  return (
    <main className="min-h-svh px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-white/15 bg-white/5 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-black/25 sm:p-7">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-balance text-lg font-semibold tracking-tight sm:text-xl">
                Student Marks Calculator
              </h1>
              <p className="mt-1 text-pretty text-xs text-muted-foreground">
                Enter marks → get total, average, CGPA, and grade. (Press <kbd>d</kbd> to toggle theme.)
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Class</label>
                <select
                  value={preset}
                  onChange={(e) => {
                    const next = e.target.value as PresetId
                    setPreset(next)
                    setMaxPerSubject(PRESETS[next].maxPerSubject)
                    setAllSubjects((prev) => Array.from(new Set([...prev, ...PRESETS[next].subjects])))
                    setRows(PRESETS[next].subjects.map((s) => newRow({ subject: s })))
                  }}
                  className="h-9 rounded-none border border-white/20 bg-white/10 px-3 text-xs font-medium tracking-widest uppercase text-foreground outline-none backdrop-blur-md transition hover:bg-white/15 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/25"
                >
                  {Object.entries(PRESETS).map(([id, p]) => (
                    <option key={id} value={id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Max / subject</label>
                <select
                  value={maxPerSubject}
                  onChange={(e) => setMaxPerSubject(e.target.value as "100" | "50")}
                  className="h-9 rounded-none border border-white/20 bg-white/10 px-3 text-xs font-medium tracking-widest uppercase text-foreground outline-none backdrop-blur-md transition hover:bg-white/15 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/25"
                >
                  <option value="100">100</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </header>

          <section className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Add your own subject (example: <span className="font-mono">Tamil</span>)
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Type subject name…"
                className="h-10 w-full rounded-none border border-white/15 bg-white/10 px-3 text-sm font-medium text-foreground outline-none transition hover:bg-white/15 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/25 sm:w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const name = newSubject.trim().replace(/\s+/g, " ")
                  if (!name) return
                  setAllSubjects((prev) => (prev.includes(name) ? prev : [...prev, name]))
                  setNewSubject("")
                }}
              >
                Add
              </Button>
            </div>
          </section>

          <section className="mt-6 grid gap-3">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              <div className="col-span-8 sm:col-span-9">Subject</div>
              <div className="col-span-4 sm:col-span-3 text-right">Marks</div>
            </div>

            <div className="grid gap-2">
              {rows.map((row, idx) => {
                const usedByOthers = new Set(
                  rows
                    .filter((r) => r.id !== row.id)
                    .map((r) => r.subject)
                    .filter(Boolean),
                )

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md dark:border-white/10 dark:bg-black/15"
                  >
                    <div className="col-span-8 sm:col-span-9">
                      <select
                        value={row.subject}
                        onChange={(e) => {
                          const subject = e.target.value
                          setRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, subject } : r)),
                          )
                        }}
                        className="h-10 w-full rounded-none border border-white/15 bg-white/10 px-3 text-xs font-semibold tracking-wide text-foreground outline-none transition hover:bg-white/15 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/25"
                      >
                        <option value="" disabled>
                          Select subject…
                        </option>
                        {subjectOptions.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.value !== row.subject && usedByOthers.has(opt.value)}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4 sm:col-span-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          inputMode="numeric"
                          value={row.marks}
                          onChange={(e) => {
                            const marks = e.target.value.replace(/[^\d.]/g, "")
                            setRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, marks } : r)),
                            )
                          }}
                          placeholder={`0-${max}`}
                          className="h-10 w-full rounded-none border border-white/15 bg-white/10 px-3 text-right text-sm font-semibold tabular-nums text-foreground outline-none transition hover:bg-white/15 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/25"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRows((prev) => prev.filter((r) => r.id !== row.id))
                          }}
                          disabled={rows.length <= 1}
                          className={cn(
                            "h-10 w-10 shrink-0 rounded-none border border-white/15 bg-white/10 text-xs font-semibold tracking-widest uppercase text-foreground/80 transition hover:bg-white/15 hover:text-foreground disabled:opacity-40 disabled:hover:bg-white/10 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/25",
                            rows.length <= 1 && "cursor-not-allowed",
                          )}
                          aria-label={`Remove row ${idx + 1}`}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRows((prev) => [...prev, newRow()])}
                >
                  Add subject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const p = PRESETS[preset]
                    setMaxPerSubject(p.maxPerSubject)
                    setAllSubjects((prev) => Array.from(new Set([...prev, ...p.subjects])))
                    setRows(p.subjects.map((s) => newRow({ subject: s })))
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Subjects: <span className="font-mono">{rows.length}</span>
              </div>
            </div>
          </section>

          <section className="mt-7 grid gap-2 sm:grid-cols-4">
            <GlassStat label="Total" value={`${total.toFixed(0)}`} sub={`out of ${(rows.length * max).toFixed(0)}`} />
            <GlassStat label="Average" value={`${avg.toFixed(2)}`} sub={`per subject (max ${max})`} />
            <GlassStat label="CGPA" value={`${cgpa.toFixed(2)}`} sub={`≈ ${pct.toFixed(2)}%`} />
            <GlassStat label="Grade" value={grade} sub="overall" />
          </section>

          <footer className="mt-6 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <div className="min-w-0">
              Tip: marks are automatically clamped to{" "}
              <span className="font-mono">
                0-{max}
              </span>
              .
            </div>
            <div className="shrink-0 font-mono">{clamp01(pct / 100) * 100 === 0 ? "" : `${pct.toFixed(2)}%`}</div>
          </footer>
        </div>
      </div>
    </main>
  )
}

function GlassStat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md dark:border-white/10 dark:bg-black/15">
      <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  )
}
