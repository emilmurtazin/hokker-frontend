// Переключатель «вкл/выкл» — крупная зона нажатия (весь блок кликабелен),
// заметное состояние (цвет + положение), доступен с клавиатуры и для читалок
// экрана. Используется вместо нативного <input type="checkbox"> там, где чекбокс
// маленький и плохо читается на телефоне (например, «Показывать меня в поиске»).
export default function Switch({ checked, onChange, label, description, disabled = false }) {
  return (
    <label
      className={`flex items-start gap-3 p-3.5 rounded-card border transition-colors ${
        disabled ? 'opacity-60' : 'cursor-pointer'
      } ${checked ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300 bg-white'}`}
    >
      <span className="min-w-0 flex-1">
        {label && <span className="block font-medium text-sm">{label}</span>}
        {description && <span className="block text-xs text-neutral-500 mt-0.5">{description}</span>}
      </span>

      {/* Настоящий чекбокс остаётся в разметке (клавиатура, читалки экрана,
          форма при сабмите), но визуально скрыт — вместо него рисуем дорожку/бегунок. */}
      <span className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          // Явное aria-label: без него читалка экрана озвучивала бы label + description
          // слитно (оба — текст внутри того же <label>), а не короткое имя переключателя.
          aria-label={label}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`block w-11 h-7 rounded-full transition-colors duration-200 ${
            checked ? 'bg-rink-900' : 'bg-ice-300'
          } peer-focus-visible:ring-2 peer-focus-visible:ring-rink-700 peer-focus-visible:ring-offset-2`}
        >
          <span
            className={`block w-5 h-5 mt-1 rounded-full bg-white shadow transition-transform duration-200 ${
              checked ? 'translate-x-[22px]' : 'translate-x-1'
            }`}
          />
        </span>
      </span>
    </label>
  )
}
