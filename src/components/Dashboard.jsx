export default function Dashboard({ target, consumed }) {
  const remaining = target - consumed
  const isOver = consumed > target
  const percentage = Math.min((consumed / target) * 100, 100)

  return (
    <div className="bg-gradient-to-br from-peach-400 to-blush-300 rounded-3xl p-6 text-white shadow-lg shadow-peach-300/40">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Target</p>
          <p className="text-2xl font-bold tabular-nums">{target.toLocaleString()}</p>
          <p className="text-white/60 text-xs">kcal</p>
        </div>
        <div className="text-center border-x border-white/20">
          <p className="text-white/60 text-xs mb-1">Eaten</p>
          <p className="text-2xl font-bold tabular-nums">{consumed.toLocaleString()}</p>
          <p className="text-white/60 text-xs">kcal</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">{isOver ? 'Over by' : 'Left'}</p>
          <p
            className={`text-2xl font-bold tabular-nums ${
              isOver ? 'text-yellow-200' : ''
            }`}
          >
            {Math.abs(remaining).toLocaleString()}
          </p>
          <p className="text-white/60 text-xs">kcal</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-white/60 mb-1.5">
          <span>0</span>
          <span>{Math.round(percentage)}% of daily goal</span>
          <span>{target.toLocaleString()}</span>
        </div>
        <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isOver ? 'bg-yellow-300' : 'bg-white'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {consumed === 0 && (
          <p className="text-center text-white/50 text-xs mt-3">
            Start logging meals to track your day ✨
          </p>
        )}
        {isOver && (
          <p className="text-center text-yellow-200/90 text-xs mt-3">
            You've gone over your goal today
          </p>
        )}
      </div>
    </div>
  )
}
