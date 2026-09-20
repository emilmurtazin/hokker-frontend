// Когда приложение открыто кнопкой из Telegram-бота (Mini App), Telegram по
// умолчанию показывает его «шторкой» на часть экрана, а свайп вниз закрывает.
// Здесь: раскрываем на весь экран и отключаем закрытие свайпом.
//
// Скрипт Telegram (telegram.org/js/telegram-web-app.js) подгружаем ТОЛЬКО внутри
// Telegram. В обычном браузере/PWA он не нужен, а в некоторых регионах
// telegram.org может быть недоступен — блокирующий <script> в index.html
// задерживал бы загрузку приложения для всех.

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
  }
  document.head.appendChild(script)
}
