export const SPECIALIZATION_LABELS = {
  skating: 'Катание',
  shooting: 'Броски',
  off_ice: 'ОФП',
  goalie: 'Вратарская техника',
  general: 'Общая подготовка',
}

export const POSITION_LABELS = {
  forward: 'Нападающий',
  defense: 'Защитник',
  goalie: 'Вратарь',
}

export const SESSION_TYPE_LABELS = {
  ice: 'Лёд',
  off_ice: 'ОФП',
  shooting: 'Броски',
  theory: 'Теория',
  game: 'Игра',
}

export const BOOKING_STATUS_LABELS = {
  pending: 'Ждёт подтверждения тренера',
  confirmed: 'Подтверждено',
  waiting: 'В листе ожидания',
  invited: 'Освободилось место — подтвердите',
  cancelled: 'Отменено',
  rejected: 'Отклонено тренером',
  expired: 'Время истекло',
}

export const BOOKING_STATUS_COLORS = {
  pending: 'text-goal bg-goal-light',
  confirmed: 'text-green-700 bg-green-50',
  waiting: 'text-neutral-500 bg-ice-200',
  invited: 'text-action bg-action-light',
  cancelled: 'text-neutral-400 bg-ice-100',
  rejected: 'text-neutral-400 bg-ice-100',
  expired: 'text-neutral-400 bg-ice-100',
}
