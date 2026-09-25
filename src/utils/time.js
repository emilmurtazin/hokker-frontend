// Список получасовых отметок для TimeField — вынесен из компонента отдельным
// модулем (не константой внутри .jsx), чтобы Fast Refresh при правке
// TimeField.jsx не перезагружал всю страницу целиком.
export function buildTimeSlots(stepMinutes = 30, startHour = 6, endHour = 23.5) {
  const slots = []
  for (let m = startHour * 60; m <= endHour * 60; m += stepMinutes) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
  }
  return slots
}

export const TIME_SLOTS = buildTimeSlots()
