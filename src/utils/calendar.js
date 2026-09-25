// Чистая логика календарной сетки — отдельно от компонента, чтобы проверить
// юнит-тестами без рендеринга (переход через границу месяца/года, длинные
// и короткие месяцы, начало недели с понедельника).

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
export const MONTH_LABELS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISODate(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Сетка месяца: всегда 6 недель по 7 дней (42 ячейки), с хвостами соседних
// месяцев — так строят календарь большинство приложений, разметка не «прыгает»
// между месяцами разной длины. Неделя начинается с понедельника.
export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const leadingDays = (first.getDay() + 6) % 7 // getDay(): вс=0 → переводим на пн=0
  const gridStart = new Date(year, month, 1 - leadingDays)

  const days = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
  }

  const weeks = []
  for (let w = 0; w < 6; w++) weeks.push(days.slice(w * 7, w * 7 + 7))
  return weeks
}

export function formatDateLabel(date, today = new Date()) {
  const base = startOfDay(today)
  const tomorrow = new Date(base)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfterTomorrow = new Date(base)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  if (sameDay(date, base)) return 'Сегодня'
  if (sameDay(date, tomorrow)) return 'Завтра'
  if (sameDay(date, dayAfterTomorrow)) return 'Послезавтра'
  return `${WEEKDAY_LABELS[(date.getDay() + 6) % 7]}, ${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`
}
