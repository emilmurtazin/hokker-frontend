import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TG_READY_EVENT, getWebApp } from '../utils/telegram'
import { hasAppHistory, isTabRoot, useGoBack } from '../utils/navigation'

function useTelegramWebApp() {
  const [webApp, setWebApp] = useState(getWebApp)
  useEffect(() => {
    if (webApp) return undefined
    // Скрипт Telegram подгружается асинхронно — ждём сигнала, что он готов.
    const onReady = () => setWebApp(getWebApp())
    window.addEventListener(TG_READY_EVENT, onReady)
    return () => window.removeEventListener(TG_READY_EVENT, onReady)
  }, [webApp])
  return webApp
}

// Подключает «Назад» в шапке Mini App (и аппаратную «Назад» на Android) к навигации
// приложения. Без этого Telegram показывает только «Закрыть», а после перехода
// на другую вкладку «Назад» либо не появляется, либо закрывает приложение целиком.
// Вне Telegram ничего не делает.
export default function TelegramBackButton() {
  const webApp = useTelegramWebApp()
  const { pathname } = useLocation()
  const goBack = useGoBack()

  // Показываем, если есть куда вернуться: предыдущий экран в истории или
  // «родитель» у вложенного экрана. На корне вкладки без истории — прячем
  // (там «Назад» = закрыть приложение, это делает Telegram).
  const visible = hasAppHistory() || !isTabRoot(pathname)

  useEffect(() => {
    const button = webApp?.BackButton
    if (!button) return
    if (visible) button.show()
    else button.hide()
  }, [webApp, visible, pathname])

  useEffect(() => {
    const button = webApp?.BackButton
    if (!button) return undefined
    button.onClick(goBack)
    return () => button.offClick(goBack)
  }, [webApp, goBack])

  return null
}
