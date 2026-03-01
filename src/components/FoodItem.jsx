import { useState } from 'react'

export default function FoodItem({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [editFood, setEditFood] = useState(item.food)
  const [editCalories, setEditCalories] = useState(String(item.calories))
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    const calories = parseInt(editCalories)
    if (editFood.trim() && !isNaN(calories) && calories >= 0) {
      onUpdate({ food: editFood.trim(), calories })
      setEditing(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditFood(item.food)
      setEditCalories(String(item.calories))
      setEditing(false)
    }
  }

  const cancelEdit = () => {
    setEditFood(item.food)
    setEditCalories(String(item.calories))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-4 py-3 bg-peach-50/60 flex items-center gap-2">
        <input
          autoFocus
          type="text"
          value={editFood}
          onChange={(e) => setEditFood(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-peach-200 bg-white text-sm text-warm-900 focus:outline-none focus:border-peach-400"
        />
        <input
          type="number"
          value={editCalories}
          onChange={(e) => setEditCalories(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1.5 rounded-xl border border-peach-200 bg-white text-sm text-warm-900 text-center focus:outline-none focus:border-peach-400"
        />
        <span className="text-xs text-warm-400 flex-shrink-0">kcal</span>
        <button
          onClick={handleSave}
          className="p-1.5 text-peach-500 hover:text-peach-600 transition-colors"
          title="Save"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          onClick={cancelEdit}
          className="p-1.5 text-warm-400 hover:text-warm-600 transition-colors"
          title="Cancel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 flex items-center gap-3 group hover:bg-warm-50/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-warm-800 truncate">{item.food}</p>
      </div>

      <span className="text-sm font-medium text-warm-600 tabular-nums flex-shrink-0">
        {item.calories.toLocaleString()} kcal
      </span>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => {
            setEditFood(item.food)
            setEditCalories(String(item.calories))
            setEditing(true)
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-warm-100 text-warm-400 hover:text-warm-700 transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        {confirmDelete ? (
          <>
            <button
              onClick={onDelete}
              className="h-7 px-2.5 flex items-center justify-center rounded-full bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-warm-100 text-warm-400 transition-colors"
              title="Cancel"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-warm-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
