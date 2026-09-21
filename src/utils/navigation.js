import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Корневые экраны вкладок нижней навигации (для всех ролей).
const TAB_ROOTS = ['/', '/schedule', '/players', '/ice', '/exercises', '/profile', '/requests']

export function isTabRoot(pathname) {
  return TAB_ROOTS.includes(pathname)
}

// Есть ли в истории браузера предыдущий экран ЭТОГО приложения.
// React Router хранит порядковый номер записи в history.state.idx: 0 — первая
// запись сессии. Так бывает, когда приложение открыто сразу на «глубоком» экране —
// по кнопке из бота или из уведомления («Открыть упражнение», «Открыть заявки»):
// вернуться через navigate(-1) некуда, и кнопка «Назад» просто ничего не делала.
export function hasAppHistory() {
  return (window.history.state?.idx ?? 0) > 0
}

// Куда вести «Назад», если истории нет: на «родительский» экран.
export function fallbackFor(pathname) {
  if (/^\/exercises\/[^/]+$/.test(pathname)) return '/exercises'
  if (/^\/players\/[^/]+\/attendance$/.test(pathname)) return '/players'
  if (/^\/children\/[^/]+\/progress$/.test(pathname)) return '/profile'
  return '/' // /sessions/:id, /coaches/:id и всё остальное — на главную роли
}

// «Назад» без тупиков: шаг по истории, а если её нет — на родительский экран.
export function useGoBack() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return useCallback(() => {
    if (hasAppHistory()) navigate(-1)
    else navigate(fallbackFor(pathname), { replace: true })
  }, [navigate, pathname])
}
