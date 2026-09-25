import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  WEEKDAY_LABELS,
  MONTH_LABELS,
  startOfDay,
  sameDay,
  toISODate,
  fromISODate,
  getMonthGrid,
  formatDateLabel,
} from '../utils/calendar'
import { useEscapeKey } from '../utils/useEscapeKey'

// Поле выбора даты: кнопки «Сегодня/Завтра/Послезавтра» для частого случая
// и календарь на месяц — для более дальних тренировок. Заменяет системный
// <input type="date">, который в Telegram Mini App и разных браузерах выглядит
// и открывается по-разному, часто мелким шрифтом.
//
//   <DateField value={date} onChange={setDate} minDate={new Date()} />
// value/onChange — строка 'YYYY-MM-DD'.
export default function DateField({ label = 'Дата', value, onChange, minDate }) {
  const [open, setOpen] = useState(false)
  const min = startOfDay(minDate || new Date())
  const selected = value ? fromISODate(value) : null
  const [viewYear, setViewYear] = useState((selected || min).getFullYear())
  const [viewMonth, setViewMonth] = useState((selected || min).getMonth())
  useEscapeKey(() => setOpen(false), open)

  function openPicker() {
    const base = selected || min
    setViewYear(base.getFullYear())
    setViewMonth(base.getMonth())
    setOpen(true)
  }

  function pick(date) {
    if (startOfDay(date) < min) return
    onChange(toISODate(date))
    setOpen(false)
  }

  function shiftMonth(delta) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setViewMonth(m)
    setViewYear(y)
  }

  const weeks = getMonthGrid(viewYear, viewMonth)
  const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(min.getFullYear(), min.getMonth(), 1)
  const quickDays = [0, 1, 2].map((offset) => {
    const d = new Date(min)
    d.setDate(d.getDate() + offset)
    return d
  })

  return (
    <div>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <button type="button" onClick={openPicker} className="input-field flex items-center gap-2 text-left">
        <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
        <span className={selected ? '' : 'text-neutral-400'}>
          {selected ? formatDateLabel(selected, min) : 'Выберите дату'}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Дата тренировки"
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
              <h3 className="font-semibold text-base">Дата тренировки</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть" className="p-2.5 -m-2.5 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="shrink-0 flex gap-2 px-5 pb-3">
              {quickDays.map((d) => {
                const isSel = selected && sameDay(selected, d)
                return (
                  <button
                    key={toISODate(d)}
                    type="button"
                    onClick={() => pick(d)}
                    className={`flex-1 px-2 py-2 rounded-full text-sm font-medium border truncate ${
                      isSel ? 'bg-rink-900 text-white border-rink-900' : 'border-ice-300'
                    }`}
                  >
                    {formatDateLabel(d, min)}
                  </button>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={() => shiftMonth(-1)}
                  aria-label="Предыдущий месяц"
                  className="p-2.5 -m-1 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-sm">
                  {MONTH_LABELS[viewMonth]} {viewYear}
                </span>
                <button type="button" onClick={() => shiftMonth(1)} aria-label="Следующий месяц" className="p-2.5 -m-1">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-xs text-neutral-400 mb-1">
                {WEEKDAY_LABELS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {weeks.flat().map((d) => {
                  const inMonth = d.getMonth() === viewMonth
                  const disabled = startOfDay(d) < min
                  const isSel = selected && sameDay(selected, d)
                  const isToday = sameDay(d, startOfDay(new Date()))
                  return (
                    <button
                      key={toISODate(d)}
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(d)}
                      aria-current={isToday ? 'date' : undefined}
                      aria-pressed={isSel}
                      className={`w-9 h-9 mx-auto rounded-full text-sm flex items-center justify-center transition-colors
                        ${!inMonth || disabled ? 'text-neutral-300' : 'text-rink-900'}
                        ${isSel ? 'bg-rink-900 text-white font-semibold' : isToday ? 'border border-rink-900 font-semibold' : ''}
                      `}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
