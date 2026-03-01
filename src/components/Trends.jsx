import { useMemo } from 'react'

// Chart layout constants (SVG viewBox units)
const C = {
  vw: 340,
  vh: 210,
  left: 38,   // y-axis label space
  right: 30,  // "Goal" label space
  top: 22,    // calorie label above bars
  bottom: 34, // day label below bars
}
C.chartW = C.vw - C.left - C.right   // 272
C.chartH = C.vh - C.top - C.bottom   // 154
C.slotW = C.chartW / 7               // ~38.9
C.barW = 22

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function dayLabel(dateStr) {
  const todayStr = new Date().toISOString().split('T')[0]
  if (dateStr === todayStr) return 'Today'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' })
}

function fmtCal(n) {
  if (n === 0) return ''
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// "On goal" = logged something AND within 80–110% of target
function isOnGoal(total, target) {
  return total >= target * 0.80 && total <= target * 1.10
}

function calStreak(data, target) {
  let s = 0
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].total > 0 && isOnGoal(data[i].total, target)) s++
    else break
  }
  return s
}

function InsightBanner({ avg, target, diff }) {
  const absDiff = Math.abs(diff).toLocaleString()
  const pctUnder = (target - avg) / target  // positive = under, negative = over

  // Tier 1: significantly under (>20% below target) — concern
  if (pctUnder > 0.20) {
    return (
      <div className="rounded-2xl px-4 py-3.5 border bg-warm-50 border-warm-200 text-sm text-warm-700">
        <span className="font-semibold">Eating too little —</span>{' '}
        you're averaging{' '}
        <span className="font-semibold">{absDiff} kcal under</span>{' '}
        your goal. Try to eat a bit more to hit your target.
      </div>
    )
  }

  // Tier 2: slightly under (5–20% below target) — neutral
  if (pctUnder > 0.05) {
    return (
      <div className="rounded-2xl px-4 py-3.5 border bg-peach-50 border-peach-100 text-sm text-peach-600">
        You're averaging{' '}
        <span className="font-semibold">{absDiff} kcal under</span>{' '}
        your goal — pretty close. A little more food would round it out.
      </div>
    )
  }

  // Tier 3: on track (within ±5% of target) — positive
  if (pctUnder >= -0.10) {
    return (
      <div className="rounded-2xl px-4 py-3.5 border bg-peach-50 border-peach-100 text-sm text-peach-600">
        <span className="font-semibold">Great balance!</span>{' '}
        You're right on track with your calorie goal this week.
      </div>
    )
  }

  // Tier 4: over goal — warning
  return (
    <div className="rounded-2xl px-4 py-3.5 border bg-blush-50 border-blush-100 text-sm text-blush-400">
      <span className="font-semibold">Heads up —</span>{' '}
      you're averaging{' '}
      <span className="font-semibold">{absDiff} kcal over</span>{' '}
      your goal this week.
    </div>
  )
}

export default function Trends({ logs, target }) {
  const days = useMemo(() => getLast7Days(), [])

  const data = useMemo(() =>
    days.map((dateStr) => {
      const dayLog = logs[dateStr] ?? {}
      const total = Object.values(dayLog)
        .flat()
        .reduce((sum, item) => sum + (item.calories || 0), 0)
      return { dateStr, total, label: dayLabel(dateStr) }
    }),
    [days, logs]
  )

  const todayStr = new Date().toISOString().split('T')[0]
  const maxVal = Math.max(target * 1.4, ...data.map((d) => d.total), 400)

  // Coordinate helpers
  const toY  = (val) => C.top + C.chartH * (1 - val / maxVal)
  const toH  = (val) => C.chartH * (val / maxVal)
  const barX = (i) => C.left + i * C.slotW + (C.slotW - C.barW) / 2
  const targetY = toY(target)

  // Y-axis gridlines: 0, half, target, max
  const gridVals = Array.from(new Set([0, Math.round(target / 2), target]))

  // Stats
  const logged = data.filter((d) => d.total > 0)
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.total, 0) / logged.length) : 0
  const daysOnTarget = data.filter((d) => d.total > 0 && isOnGoal(d.total, target)).length
  const streak = calStreak(data, target)
  const diff = avg - target

  return (
    <div className="space-y-4">
      {/* Bar chart card */}
      <div className="bg-white rounded-3xl shadow-sm border border-warm-100/80 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-warm-800 text-sm">7-Day Intake</h3>
            <p className="text-xs text-warm-400 mt-0.5">Compared to your {target.toLocaleString()} kcal goal</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end text-xs text-warm-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#FFCFBF' }} />
              Under goal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#FFB5C8' }} />
              Over goal
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${C.vw} ${C.vh}`}
          width="100%"
          style={{ display: 'block', height: '210px' }}
          aria-label="7-day calorie intake bar chart"
        >
          <defs>
            <linearGradient id="barUnder" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB09A" />
              <stop offset="100%" stopColor="#FFD9CC" />
            </linearGradient>
            <linearGradient id="barOver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8FAA" />
              <stop offset="100%" stopColor="#FFC8D8" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines + y-axis labels */}
          {gridVals.map((val) => {
            const y = toY(val)
            return (
              <g key={val}>
                <line
                  x1={C.left} y1={y}
                  x2={C.vw - C.right} y2={y}
                  stroke={val === target ? 'none' : '#F0E8E7'}
                  strokeWidth={1}
                />
                <text
                  x={C.left - 5} y={y + 3.5}
                  textAnchor="end" fontSize={8.5} fill="#C4A4A3"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : val}
                </text>
              </g>
            )
          })}

          {/* Dashed target / goal line */}
          <line
            x1={C.left} y1={targetY}
            x2={C.vw - C.right} y2={targetY}
            stroke="#FF8C73" strokeWidth={1.5}
            strokeDasharray="4 3" opacity={0.65}
          />
          <text
            x={C.vw - C.right + 4} y={targetY + 3.5}
            fontSize={8} fill="#FF8C73" opacity={0.85} fontWeight="500"
          >
            Goal
          </text>

          {/* Bars */}
          {data.map((d, i) => {
            const x = barX(i)
            const isOver = d.total > target
            const isToday = d.dateStr === todayStr
            const hasData = d.total > 0
            const barH = toH(d.total)
            const barY = toY(d.total)
            const labelY = C.top + C.chartH + 16

            return (
              <g key={d.dateStr}>
                {/* Empty-day background slot */}
                {!hasData && (
                  <rect
                    x={x} y={C.top}
                    width={C.barW} height={C.chartH}
                    fill="#FAF5F4" rx={5}
                  />
                )}

                {/* Filled bar */}
                {hasData && (
                  <>
                    <rect
                      x={x} y={barY}
                      width={C.barW} height={barH}
                      fill={isOver ? 'url(#barOver)' : 'url(#barUnder)'}
                      rx={5}
                    />
                    {/* Calorie label above bar */}
                    <text
                      x={x + C.barW / 2} y={barY - 4}
                      textAnchor="middle"
                      fontSize={8.5}
                      fontWeight={isToday ? '600' : '400'}
                      fill={isOver ? '#E05580' : '#D4633E'}
                    >
                      {fmtCal(d.total)}
                    </text>
                  </>
                )}

                {/* Day label */}
                <text
                  x={x + C.barW / 2} y={labelY}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={isToday ? '600' : '400'}
                  fill={isToday ? '#FF8C73' : '#A67F7E'}
                >
                  {d.label}
                </text>

                {/* Today dot indicator */}
                {isToday && (
                  <circle
                    cx={x + C.barW / 2} cy={labelY + 9}
                    r={2.5} fill="#FF8C73"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            value: avg > 0 ? avg.toLocaleString() : '—',
            label: 'Avg / day',
            sub: avg > 0 ? (avg <= target ? 'kcal' : 'kcal') : null,
          },
          {
            value: `${daysOnTarget}`,
            label: 'Days on goal',
            sub: 'of 7',
          },
          {
            value: streak,
            label: 'Day streak',
            sub: streak === 1 ? 'day' : 'days',
          },
        ].map(({ value, label, sub }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 border border-warm-100/80 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-warm-800 tabular-nums leading-none">
              {value}
              {sub && <span className="text-xs text-warm-400 font-normal ml-1">{sub}</span>}
            </p>
            <p className="text-xs text-warm-400 mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Insight banner */}
      {avg > 0 ? (
        <InsightBanner avg={avg} target={target} diff={diff} />
      ) : (
        <div className="rounded-2xl px-4 py-3.5 border border-warm-100 bg-warm-50 text-sm text-warm-400 text-center">
          Log some meals to start seeing your weekly trends.
        </div>
      )}
    </div>
  )
}
