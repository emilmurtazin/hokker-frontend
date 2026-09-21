// Когда приложение открыто кнопкой из Telegram-бота (Mini App), Telegram по
// умолчанию показывает его «шторкой» на часть экрана, а свайп вниз закрывает.
// Здесь: раскрываем на весь экран и отключаем закрытие свайпом.
//
// Скрипт Telegram (telegram.org/js/telegram-web-app.js) подгружаем ТОЛЬКО внутри
// Telegram. В обычном браузере/PWA он не нужен, а в некоторых регионах
// telegram.org может быть недоступен — блокирующий <script> в index.html
// задерживал бы загрузку приложения для всех.

export const TG_READY_EVENT = 'hokker:tg-ready'

// WebApp из SDK Telegram или null (обычный браузер / SDK ещё не загрузился).
// Кнопка «Назад» в шапке Mini App появилась в Bot API 6.1 — на более старых
// клиентах её нет, и мы её не трогаем.
export function getWebApp() {
  const webApp = window.Telegram?.WebApp
  if (!webApp?.BackButton) return null
  if (webApp.isVersionAtLeast && !webApp.isVersionAtLeast('6.1')) return null
  return webApp
}

function isInsideTelegram() {
  // Telegram Desktop/Web передаёт параметры в hash, мобильные клиенты — через TelegramWebviewProxy.
  return (
    /tgWebApp(Data|Platform|Version)/.test(window.location.hash) ||
    Boolean(window.TelegramWebviewProxy)
  )
}

export function initTelegramMiniApp() {
  if (!isInsideTelegram()) return

  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-web-app.js'
  script.async = true
  script.onload = () => {
    try {
      const webApp = window.Telegram?.WebApp
      if (!webApp) return
      webApp.ready()
      webApp.expand()
      if (webApp.isVersionAtLeast?.('7.7')) webApp.disableVerticalSwipes?.()
    } catch {
      // Не критично: приложение работает и без раскрытия на весь экран.
    }
    // Даём знать интерфейсу, что SDK загрузился (например, чтобы подключить кнопку «Назад»).
    window.dispatchEvent(new Event(TG_READY_EVENT))
  }
  document.head.appendChild(script)
}
