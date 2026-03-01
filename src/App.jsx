import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding'
import DailyLog from './components/DailyLog'

const STORAGE_KEYS = {
  USER: 'ct_user',
  LOGS: 'ct_logs',
}

const EMPTY_DAY = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  drinks: [],
}

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER, null))
  const [logs, setLogs] = useState(() => loadFromStorage(STORAGE_KEYS.LOGS, {}))
  const [currentDate, setCurrentDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs))
  }, [logs])

  const addFoodItems = (date, meal, items) => {
    setLogs((prev) => {
      const day = prev[date] ?? { ...EMPTY_DAY }
      return {
        ...prev,
        [date]: {
          ...day,
          [meal]: [
            ...(day[meal] ?? []),
            ...items.map((item) => ({
              id: crypto.randomUUID(),
              food: item.food,
              calories: item.calories,
              addedAt: Date.now(),
            })),
          ],
        },
      }
    })
  }

  const updateFoodItem = (date, meal, itemId, updates) => {
    setLogs((prev) => {
      const day = prev[date]
      if (!day?.[meal]) return prev
      return {
        ...prev,
        [date]: {
          ...day,
          [meal]: day[meal].map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        },
      }
    })
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.LOGS)
    setLogs({})
    setUser(null)
  }

  const deleteFoodItem = (date, meal, itemId) => {
    setLogs((prev) => {
      const day = prev[date]
      if (!day?.[meal]) return prev
      return {
        ...prev,
        [date]: {
          ...day,
          [meal]: day[meal].filter((item) => item.id !== itemId),
        },
      }
    })
  }

  if (!user) {
    return <Onboarding onSave={setUser} />
  }

  return (
    <DailyLog
      user={user}
      logs={logs}
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      addFoodItems={addFoodItems}
      updateFoodItem={updateFoodItem}
      deleteFoodItem={deleteFoodItem}
      onUpdateUser={updateUser}
      onClearData={clearAllData}
    />
  )
}
