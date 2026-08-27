const dtFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })

export function formatDateTime(iso) {
  return dtFormatter.format(new Date(iso))
}

export function formatDate(iso) {
  return dateFormatter.format(new Date(iso))
}

export function formatTime(iso) {
  return timeFormatter.format(new Date(iso))
}

export function formatSlotTime(timeStr) {
  return timeStr?.slice(0, 5) || ''
}

export function formatSlotDate(dateStr) {
  // date-only строка "2026-09-10" — new Date() интерпретирует её как UTC
  // полночь, что может сдвинуть день в минус при выводе в локальной TZ.
  // Разбираем вручную, чтобы избежать этого смещения.
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  })
}
export function age(birthDateIso) {
  const birth = new Date(birthDateIso)
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) years -= 1
  return years
}
