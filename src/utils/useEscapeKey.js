import { useEffect } from 'react'

// Закрывает шторку/модалку по Esc — удобно на компьютере и с внешней клавиатурой.
// enabled позволяет не вешать обработчик, пока сама шторка не открыта.
export function useEscapeKey(onClose, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, enabled])
}
