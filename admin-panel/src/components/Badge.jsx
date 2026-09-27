const PALETTES = {
  gray: 'bg-ice-200 text-rink-900',
  green: 'bg-green-100 text-green-800',
  red: 'bg-action-light text-action',
  yellow: 'bg-goal-light text-goal',
  blue: 'bg-rink-900/10 text-rink-900',
}

export default function Badge({ children, color = 'gray' }) {
  return <span className={`badge ${PALETTES[color] || PALETTES.gray}`}>{children}</span>
}

export const ROLE_LABELS = {
  parent: 'Родитель',
  coach: 'Тренер',
  arena_admin: 'Администратор арены',
  admin: 'Администратор',
}

export const ROLE_COLORS = {
  parent: 'blue',
  coach: 'green',
  arena_admin: 'yellow',
  admin: 'red',
}

export const BOOKING_STATUS_LABELS = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждена',
  waiting: 'Лист ожидания',
  invited: 'Приглашён',
  cancelled: 'Отменена',
  rejected: 'Отклонена',
  expired: 'Не подтвердил вовремя',
}

export const BOOKING_STATUS_COLORS = {
  pending: 'yellow',
  confirmed: 'green',
  waiting: 'blue',
  invited: 'blue',
  cancelled: 'gray',
  rejected: 'red',
  expired: 'gray',
}

export const SLOT_REQUEST_STATUS_LABELS = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  cancelled_by_coach: 'Отменена тренером',
}

export const SLOT_REQUEST_STATUS_COLORS = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled_by_coach: 'gray',
}

export const SESSION_TYPE_LABELS = {
  ice: 'Лёд',
  off_ice: 'Вне льда',
  shooting: 'Бросок',
  theory: 'Теория',
  game: 'Игра',
  goalie: 'Вратарь',
}

export const SLOT_STATUS_LABELS = {
  available: 'Свободен',
  pending: 'На рассмотрении',
  booked: 'Забронирован',
}

export const SLOT_STATUS_COLORS = {
  available: 'green',
  pending: 'yellow',
  booked: 'blue',
}
