import { useState } from 'react'
import { apiRequest } from '../../api/client'
import Switch from '../../components/Switch'
import { SPECIALIZATION_LABELS, AGE_GROUPS } from '../../utils/labels'

function toggleInArray(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

export default function CoachProfileForm({ initial, onSaved, onCancel }) {
  const [specializations, setSpecializations] = useState(initial?.specializations || [])
  const [ageGroups, setAgeGroups] = useState(initial?.age_groups || [])
  const [experienceYears, setExperienceYears] = useState(initial?.experience_years ?? '')
  const [about, setAbout] = useState(initial?.about || '')
  const [visibleInSearch, setVisibleInSearch] = useState(initial?.visible_in_search ?? true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (specializations.length === 0) {
      setError('Выберите хотя бы одну специализацию')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const profile = await apiRequest('/coaches/me/profile', {
        method: 'POST',
        body: {
          specializations,
          experience_years: experienceYears === '' ? null : Number(experienceYears),
          about: about || null,
          age_groups: ageGroups,
          visible_in_search: visibleInSearch,
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
        <div>
          <span className="block text-sm font-medium mb-1.5">
            Специализация <span className="text-neutral-400 font-normal">(можно несколько)</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => {
              const checked = specializations.includes(value)
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-2.5 rounded-card border text-sm cursor-pointer ${
                    checked ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setSpecializations((prev) => toggleInArray(prev, value))}
                  />
                  {label}
                </label>
              )
            })}
          </div>
        </div>

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

        <div>
          <span className="block text-sm font-medium mb-1.5">
            Возрастные группы <span className="text-neutral-400 font-normal">(можно несколько)</span>
          </span>
          <div className="flex gap-2">
            {AGE_GROUPS.map((value) => {
              const checked = ageGroups.includes(value)
              return (
                <label
                  key={value}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-card border text-sm cursor-pointer ${
                    checked ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setAgeGroups((prev) => toggleInArray(prev, value))}
                  />
                  {value}
                </label>
              )
            })}
          </div>
        </div>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">О себе</span>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="input-field min-h-[100px] resize-none"
            placeholder="Расскажите родителям о своём подходе к тренировкам"
          />
        </label>

        <Switch
          checked={visibleInSearch}
          onChange={setVisibleInSearch}
          label="Показывать меня в поиске"
          description={
            visibleInSearch
              ? 'Родители найдут вас в каталоге и общей ленте тренировок города.'
              : 'Вы не будете отображаться в каталоге и общей ленте открытых тренировок. Ученики, ' +
                'которых вы уже добавили в базу, и записанные родители по-прежнему видят ваш профиль ' +
                'и записи, а закрытые тренировки остаются доступны их группам.'
          }
        />

        {error && <p className="text-action text-sm">{error}</p>}
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Отмена
            </button>
          )}
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}
