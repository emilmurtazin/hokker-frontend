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
