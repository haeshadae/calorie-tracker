import { useState } from 'react'

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
  { key: 'light', label: 'Light', desc: '1–3 days/week', multiplier: 1.375 },
  { key: 'moderate', label: 'Moderate', desc: '3–5 days/week', multiplier: 1.55 },
  { key: 'active', label: 'Active', desc: '6–7 days/week', multiplier: 1.725 },
  { key: 'veryActive', label: 'Very Active', desc: 'Hard daily exercise', multiplier: 1.9 },
]

function calculateDailyTarget(gender, weightKg, heightCm, age, activityKey) {
  const activity = ACTIVITY_LEVELS.find((a) => a.key === activityKey)
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  return Math.round(bmr * activity.multiplier)
}

export default function Onboarding({ onSave }) {
  const [form, setForm] = useState({
    name: '',
    gender: 'female',
    heightVal: '',
    weightVal: '',
    age: '',
    activity: 'moderate',
  })
  const [units, setUnits] = useState('metric')
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    const h = parseFloat(form.heightVal)
    const w = parseFloat(form.weightVal)
    const a = parseInt(form.age)
    if (!form.heightVal || isNaN(h) || h <= 0) errs.height = 'Enter a valid height'
    if (!form.weightVal || isNaN(w) || w <= 0) errs.weight = 'Enter a valid weight'
    if (!form.age || isNaN(a) || a < 10 || a > 120) errs.age = 'Enter a valid age'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    let weightKg = parseFloat(form.weightVal)
    let heightCm = parseFloat(form.heightVal)

    if (units === 'imperial') {
      weightKg = weightKg * 0.453592
      heightCm = heightCm * 2.54
    }

    const dailyTarget = calculateDailyTarget(
      form.gender,
      weightKg,
      heightCm,
      parseInt(form.age),
      form.activity
    )

    onSave({
      name: form.name.trim(),
      gender: form.gender,
      weightKg: Math.round(weightKg * 10) / 10,
      heightCm: Math.round(heightCm * 10) / 10,
      age: parseInt(form.age),
      activity: form.activity,
      dailyTarget,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-50 to-blush-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-3xl font-bold text-warm-900">Welcome to Bloom</h1>
          <p className="text-warm-500 mt-2 text-sm">
            Tell us a little about yourself so we can personalize your daily calorie goal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-peach-200/40 border border-peach-100/60"
        >
          {/* Name */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Sarah"
              className="w-full px-4 py-3 rounded-2xl border border-warm-100 bg-warm-50/70 text-warm-900 placeholder-warm-300 focus:outline-none focus:border-peach-300 focus:bg-white transition-all text-sm"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
          </div>

          {/* Gender */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">
              Gender
            </label>
            <div className="flex gap-3">
              {[
                { key: 'female', label: '♀ Female' },
                { key: 'male', label: '♂ Male' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update('gender', key)}
                  className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                    form.gender === key
                      ? 'bg-gradient-to-r from-peach-400 to-blush-300 text-white shadow-md'
                      : 'bg-warm-50 text-warm-600 border border-warm-100 hover:border-peach-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit toggle */}
          <div className="mb-4 flex justify-between items-center">
            <label className="text-xs font-semibold text-warm-600 uppercase tracking-wide">
              Measurements
            </label>
            <div className="flex bg-warm-50 rounded-full p-1 border border-warm-100">
              {['metric', 'imperial'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnits(u)}
                  className={`px-4 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    units === u ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">
                Height ({units === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={form.heightVal}
                onChange={(e) => update('heightVal', e.target.value)}
                placeholder={units === 'metric' ? '165' : '65'}
                className="w-full px-4 py-3 rounded-2xl border border-warm-100 bg-warm-50/70 text-warm-900 placeholder-warm-300 focus:outline-none focus:border-peach-300 focus:bg-white transition-all text-sm"
              />
              {errors.height && <p className="text-red-400 text-xs mt-1.5">{errors.height}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">
                Weight ({units === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                value={form.weightVal}
                onChange={(e) => update('weightVal', e.target.value)}
                placeholder={units === 'metric' ? '65' : '143'}
                className="w-full px-4 py-3 rounded-2xl border border-warm-100 bg-warm-50/70 text-warm-900 placeholder-warm-300 focus:outline-none focus:border-peach-300 focus:bg-white transition-all text-sm"
              />
              {errors.weight && <p className="text-red-400 text-xs mt-1.5">{errors.weight}</p>}
            </div>
          </div>

          {/* Age */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">
              Age
            </label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
              placeholder="28"
              className="w-full px-4 py-3 rounded-2xl border border-warm-100 bg-warm-50/70 text-warm-900 placeholder-warm-300 focus:outline-none focus:border-peach-300 focus:bg-white transition-all text-sm"
            />
            {errors.age && <p className="text-red-400 text-xs mt-1.5">{errors.age}</p>}
          </div>

          {/* Activity Level */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-3">
              Activity Level
            </label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => update('activity', level.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all ${
                    form.activity === level.key
                      ? 'bg-peach-50 border-peach-300'
                      : 'bg-warm-50/50 border-warm-100 hover:border-peach-200'
                  }`}
                >
                  <div>
                    <span className="text-sm font-medium text-warm-800">{level.label}</span>
                    <span className="text-xs text-warm-400 ml-2">{level.desc}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      form.activity === level.key
                        ? 'bg-peach-400 border-peach-400'
                        : 'border-warm-200'
                    }`}
                  >
                    {form.activity === level.key && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-peach-400 to-blush-300 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all text-sm"
          >
            Calculate My Daily Goal ✨
          </button>
        </form>
      </div>
    </div>
  )
}
