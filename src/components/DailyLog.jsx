import { useState } from 'react'
import Dashboard from './Dashboard'
import MealSection from './MealSection'
import Settings from './Settings'
import Trends from './Trends'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { key: 'lunch', label: 'Lunch', emoji: '🥗' },
  { key: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { key: 'snacks', label: 'Snacks', emoji: '🍎' },
  { key: 'drinks', label: 'Drinks', emoji: '💧' },
]

const EMPTY_DAY = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  drinks: [],
}

function formatDate(dateStr) {
  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0]

  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'

  // Parse as local date to avoid timezone issues
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export default function DailyLog({
  user,
  logs,
  currentDate,
  setCurrentDate,
  addFoodItems,
  updateFoodItem,
  deleteFoodItem,
  onUpdateUser,
  onClearData,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('log')
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = currentDate === todayStr
  const dayLog = logs[currentDate] ?? EMPTY_DAY

  const totalCalories = Object.values(dayLog)
    .flat()
    .reduce((sum, item) => sum + (item.calories || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-50 via-white to-blush-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-warm-100/60">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">🌸</span>
            <span className="font-bold text-warm-900 text-lg tracking-tight">Bloom</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-warm-700">{user.name}</p>
              <p className="text-xs text-warm-400">{user.dailyTarget.toLocaleString()} kcal/day</p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-50 text-warm-400 hover:text-warm-700 transition-colors border border-warm-100"
              aria-label="Settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <Settings
          user={user}
          onUpdateUser={(updated) => { onUpdateUser(updated); setSettingsOpen(false) }}
          onClearData={onClearData}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
        {/* Tab switcher */}
        <div className="flex bg-warm-100/60 rounded-full p-1 mb-5 w-fit mx-auto">
          {[
            { key: 'log', label: 'Daily Log' },
            { key: 'trends', label: 'Trends' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-warm-900 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'log' && (
          <>
            {/* Date navigation */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setCurrentDate(shiftDate(currentDate, -1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-warm-100 text-warm-600 hover:bg-warm-50 hover:border-warm-200 transition-all shadow-sm"
                aria-label="Previous day"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <h2 className="font-semibold text-warm-900 text-base">{formatDate(currentDate)}</h2>
                {!isToday && (
                  <button
                    onClick={() => setCurrentDate(todayStr)}
                    className="text-xs text-peach-400 hover:text-peach-500 mt-0.5 transition-colors"
                  >
                    Back to today
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentDate(shiftDate(currentDate, 1))}
                disabled={isToday}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-warm-100 text-warm-600 hover:bg-warm-50 hover:border-warm-200 transition-all shadow-sm disabled:opacity-25 disabled:cursor-not-allowed"
                aria-label="Next day"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Dashboard summary */}
            <Dashboard target={user.dailyTarget} consumed={totalCalories} />

            {/* Meal sections */}
            <div className="space-y-3 mt-5">
              {MEALS.map((meal) => (
                <MealSection
                  key={meal.key}
                  meal={meal.key}
                  label={meal.label}
                  emoji={meal.emoji}
                  items={dayLog[meal.key] ?? []}
                  onAddItems={(items) => addFoodItems(currentDate, meal.key, items)}
                  onUpdateItem={(itemId, updates) => updateFoodItem(currentDate, meal.key, itemId, updates)}
                  onDeleteItem={(itemId) => deleteFoodItem(currentDate, meal.key, itemId)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'trends' && (
          <Trends logs={logs} target={user.dailyTarget} />
        )}
      </main>
    </div>
  )
}
