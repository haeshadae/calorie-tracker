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

export default function Settings({ user, onUpdateUser, onClearData, onClose }) {
  const [form, setForm] = useState({
    name: user.name,
    gender: user.gender,
    heightVal: String(user.heightCm),
    weightVal: String(user.weightKg),
    age: String(user.age),
    activity: user.activity,
  })
  const [units, setUnits] = useState('metric')
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSaved(false)
  }

  const handleUnitToggle = (newUnit) => {
    if (newUnit === units) return
    // Convert current displayed values when switching units
    const h = parseFloat(form.heightVal)
    const w = parseFloat(form.weightVal)
    if (newUnit === 'imperial') {
      setForm((prev) => ({
        ...prev,
        heightVal: isNaN(h) ? '' : String(Math.round((h / 2.54) * 10) / 10),
        weightVal: isNaN(w) ? '' : String(Math.round((w / 0.453592) * 10) / 10),
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        heightVal: isNaN(h) ? '' : String(Math.round(h * 2.54 * 10) / 10),
        weightVal: isNaN(w) ? '' : String(Math.round(w * 0.453592 * 10) / 10),
      }))
    }
    setUnits(newUnit)
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

  const handleSave = () => {
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

    onUpdateUser({
      name: form.name.trim(),
      gender: form.gender,
      weightKg: Math.round(weightKg * 10) / 10,
      heightCm: Math.round(heightCm * 10) / 10,
      age: parseInt(form.age),
      activity: form.activity,
      dailyTarget,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-warm-900/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100">
          <h2 className="font-bold text-warm-900 text-base">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-50 text-warm-400 hover:text-warm-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Section: Profile */}
          <p className="text-xs font-semibold text-warm-400 uppercase tracking-wide">Profile</p>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-warm-100 bg-warm-50/70 text-sm text-warm-900 focus:outline-none focus:border-peach-300 focus:bg-white transition-all"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-1.5">Gender</label>
            <div className="flex gap-2">
              {[
                { key: 'female', label: '♀ Female' },
                { key: 'male', label: '♂ Male' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update('gender', key)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    form.gender === key
                      ? 'bg-gradient-to-r from-peach-400 to-blush-300 text-white shadow-sm'
                      : 'bg-warm-50 text-warm-600 border border-warm-100 hover:border-peach-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Units toggle */}
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-warm-600">Units</label>
            <div className="flex bg-warm-50 rounded-full p-1 border border-warm-100">
              {['metric', 'imperial'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitToggle(u)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    units === u ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-warm-600 mb-1.5">
                Height ({units === 'metric' ? 'cm' : 'in'})
              </label>
              <input
                type="number"
                value={form.heightVal}
                onChange={(e) => update('heightVal', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-warm-100 bg-warm-50/70 text-sm text-warm-900 focus:outline-none focus:border-peach-300 focus:bg-white transition-all"
              />
              {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-600 mb-1.5">
                Weight ({units === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                value={form.weightVal}
                onChange={(e) => update('weightVal', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-warm-100 bg-warm-50/70 text-sm text-warm-900 focus:outline-none focus:border-peach-300 focus:bg-white transition-all"
              />
              {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight}</p>}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-1.5">Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-warm-100 bg-warm-50/70 text-sm text-warm-900 focus:outline-none focus:border-peach-300 focus:bg-white transition-all"
            />
            {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
          </div>

          {/* Activity */}
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-1.5">Activity Level</label>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => update('activity', level.key)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border text-left transition-all ${
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
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      form.activity === level.key ? 'bg-peach-400 border-peach-400' : 'border-warm-200'
                    }`}
                  >
                    {form.activity === level.key && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-2 border-t border-warm-100">
            <p className="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">
              Danger Zone
            </p>
            {confirmClear ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-sm text-red-700 font-medium mb-1">Are you sure?</p>
                <p className="text-xs text-red-500 mb-4">
                  This will delete all your logs and profile. You'll start fresh from onboarding.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onClearData}
                    className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Yes, clear everything
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2.5 rounded-full bg-white border border-warm-200 text-warm-700 text-sm font-medium hover:bg-warm-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-2.5 rounded-full border border-red-200 text-red-400 text-sm font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all"
              >
                Clear all data &amp; start over
              </button>
            )}
          </div>
        </div>

        {/* Sticky save button */}
        <div className="px-5 py-4 border-t border-warm-100 bg-white">
          <button
            onClick={handleSave}
            className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-100 text-green-700'
                : 'bg-gradient-to-r from-peach-400 to-blush-300 text-white shadow-md hover:brightness-105 active:scale-[0.98]'
            }`}
          >
            {saved ? '✓ Saved & recalculated' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}
