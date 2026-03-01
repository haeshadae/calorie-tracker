import { useState } from 'react'
import FoodItem from './FoodItem'

export default function MealSection({ meal, label, emoji, items, onAddItems, onUpdateItem, onDeleteItem }) {
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mealTotal = items.reduce((sum, item) => sum + (item.calories || 0), 0)

  const handleAdd = async () => {
    const text = inputText.trim()
    if (!text || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/estimate-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodText: text, meal: label }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      if (data.items?.length > 0) {
        onAddItems(data.items)
        setInputText('')
      }
    } catch (err) {
      setError(err.message || 'Could not estimate calories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-warm-100/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-warm-50">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{emoji}</span>
          <h3 className="font-semibold text-warm-800 text-sm">{label}</h3>
          {items.length > 0 && (
            <span className="text-xs text-warm-400 bg-warm-50 px-2 py-0.5 rounded-full">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {mealTotal > 0 && (
          <span className="text-sm font-semibold text-peach-500 tabular-nums">
            {mealTotal.toLocaleString()} kcal
          </span>
        )}
      </div>

      {/* Food items list */}
      {items.length > 0 && (
        <div className="divide-y divide-warm-50">
          {items.map((item) => (
            <FoodItem
              key={item.id}
              item={item}
              onUpdate={(updates) => onUpdateItem(item.id, updates)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="px-4 py-3.5">
        {error && (
          <p className="text-red-400 text-xs mb-2 px-1">{error}</p>
        )}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={`e.g. "2 eggs, toast with butter"`}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-full border border-warm-100 bg-warm-50/70 text-sm text-warm-900 placeholder-warm-300 focus:outline-none focus:border-peach-300 focus:bg-white disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!inputText.trim() || loading}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-peach-400 text-white hover:bg-peach-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Add food"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
