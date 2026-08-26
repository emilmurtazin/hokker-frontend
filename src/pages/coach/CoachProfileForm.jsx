import { useState } from 'react'
import { apiRequest } from '../../api/client'
import { SPECIALIZATION_LABELS } from '../../utils/labels'

export default function CoachProfileForm({ initial, onSaved }) {
  const [specialization, setSpecialization] = useState(initial?.specialization || 'general')
  const [experienceYears, setExperienceYears] = useState(initial?.experience_years ?? '')
  const [about, setAbout] = useState(initial?.about || '')
  const [ageGroups, setAgeGroups] = useState(initial?.age_groups || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const profile = await apiRequest('/coaches/me/profile', {
        method: 'POST',
        body: {
          specialization,
          experience_years: experienceYears === '' ? null : Number(experienceYears),
          about: about || null,
          age_groups: ageGroups || null,
        },
      })
      onSaved(profile)
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить профиль')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-5 py-6">
      {!initial && (
        <div className="mb-5">
          <h1 className="text-xl font-semibold mb-1">Заполните профиль</h1>
          <p className="text-sm text-neutral-500">
            Родители найдут вас в каталоге только после этого шага.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Специализация</span>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="input-field"
          >
            {Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Опыт работы (лет)</span>
          <input
            type="number"
            min="0"
            max="60"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="input-field"
            placeholder="5"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Возрастные группы</span>
          <input
            type="text"
            value={ageGroups}
            onChange={(e) => setAgeGroups(e.target.value)}
            className="input-field"
            placeholder="6-9, 10-12, 13+"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">О себе</span>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="input-field min-h-[100px] resize-none"
            placeholder="Расскажите родителям о своём подходе к тренировкам"
          />
        </label>

        {error && <p className="text-action text-sm">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}
