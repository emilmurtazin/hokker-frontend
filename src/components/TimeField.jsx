import { useState } from 'react'
import { Clock, X } from 'lucide-react'
import { TIME_SLOTS } from '../utils/time'
import { useEscapeKey } from '../utils/useEscapeKey'

// Поле выбора времени: сетка частых значений + системный ввод для точного
// времени. Заменяет системный <input type="time">, у которого в Telegram
// Mini App и части браузеров мелкая, неудобная на телефоне область нажатия.
//
//   <TimeField value={time} onChange={setTime} /> — value/onChange: строка 'HH:mm'.
export default function TimeField({ label = 'Время', value, onChange }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')
  useEscapeKey(() => setOpen(false), open)

  function openPicker() {
    // Значение для «Своего времени» считаем в момент открытия, а не в эффекте:
    // это обычное производное состояние конкретного действия пользователя,
    // а не синхронизация с внешней системой.
    setCustom(value && !TIME_SLOTS.includes(value) ? value : '')
    setOpen(true)
  }

  function applyCustom() {
    if (!custom) return
    onChange(custom)
    setOpen(false)
  }

  return (
    <div>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <button type="button" onClick={openPicker} className="input-field flex items-center gap-2 text-left">
        <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
        <span className={value ? '' : 'text-neutral-400'}>{value || 'Выберите время'}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Время начала"
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-rink-900/40"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm flex flex-col max-h-[85dvh]"
          >
            <div
              className="shrink-0 flex items-center justify-between px-5 pb-3"
              style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
            >
              <h3 className="font-semibold text-base">Время начала</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть" className="p-2.5 -m-2.5 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onChange(t)
                      setOpen(false)
                    }}
                    className={`py-2.5 rounded-card text-sm font-medium border ${
                      value === t ? 'bg-rink-900 text-white border-rink-900' : 'border-ice-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="shrink-0 px-5 pt-3 border-t border-ice-200"
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
              <label htmlFor="time-field-custom" className="block text-xs text-neutral-500 mb-1.5">
                Своё время
              </label>
              <div className="flex gap-2">
                <input
                  id="time-field-custom"
                  type="time"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="input-field flex-1"
                />
                <button type="button" disabled={!custom} onClick={applyCustom} className="btn-primary px-4 disabled:opacity-40">
                  Готово
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
