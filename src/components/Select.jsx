import { useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { useEscapeKey } from '../utils/useEscapeKey'

// Поле-выпадающий список в стиле остального приложения (не системный <select>,
// вид которого браузер и Telegram Mini App рисуют по-разному и мелким шрифтом).
// Открывает знакомую шторку снизу с крупными пунктами вместо системного пикера.
//
//   <Select label="Тип" value={type} onChange={setType}
//           options={[{ value: 'ice', label: 'Лёд' }, ...]} />
export default function Select({ label, value, options, onChange, placeholder = 'Выберите' }) {
  const [open, setOpen] = useState(false)
  useEscapeKey(() => setOpen(false), open)
  const current = options.find((o) => o.value === value)

  return (
    <div>
      {label && <span className="block text-sm font-medium mb-1.5">{label}</span>}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="input-field flex items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${current ? '' : 'text-neutral-400'}`}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label || placeholder}
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-rink-900/40"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm flex flex-col max-h-[80dvh]"
          >
            <div
              className="shrink-0 flex items-center justify-between px-5 pb-3"
              style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
            >
              <h3 className="font-semibold text-base">{label || placeholder}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть" className="p-2.5 -m-2.5 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-2">
              {options.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm ${
                    o.value === value ? 'bg-rink-900/[0.04] font-medium text-rink-900' : ''
                  }`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{o.label}</span>
                    {o.hint && <span className="block text-xs text-neutral-400 truncate">{o.hint}</span>}
                  </span>
                  {o.value === value && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
