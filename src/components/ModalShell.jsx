import { X } from 'lucide-react'
import { useEscapeKey } from '../utils/useEscapeKey'

// Каркас модального окна: заголовок с крестиком и кнопка(и) внизу закреплены
// и всегда видны, прокручивается только середина. Раньше у крестика и кнопки
// «Создать»/«Сохранить» не было фиксированного места — они были частью общего
// прокручиваемого блока, и на маленьких экранах или в длинных формах крестик
// уезжал за верхний край при прокрутке и становился недоступен для нажатия.
//
//   <ModalShell title="..." onClose={...} footer={<button className="btn-primary w-full">Готово</button>}>
//     ...поля формы...
//   </ModalShell>
//
// Если нужно, чтобы Enter в поле и кнопка в footer сабмитили форму — передайте
// onSubmit, тогда сама оболочка станет <form>.
export default function ModalShell({ title, onClose, children, footer, onSubmit, maxWidthClass = 'sm:max-w-sm' }) {
  const Wrapper = onSubmit ? 'form' : 'div'
  useEscapeKey(onClose)

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <Wrapper
        {...(onSubmit ? { onSubmit } : {})}
        className={`bg-white rounded-t-2xl sm:rounded-card w-full ${maxWidthClass} flex flex-col max-h-[92dvh] sm:max-h-[85dvh]`}
      >
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-5 pb-4 border-b border-ice-200"
          style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
        >
          <h2 className="font-semibold text-lg truncate">{title}</h2>
          {/* Зона нажатия крестика заметно больше самой иконки (отрицательный margin
              компенсирует padding — соседние элементы от этого не сдвигаются). */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="p-2.5 -m-2.5 text-neutral-400 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">{children}</div>

        {footer && (
          <div
            className="shrink-0 px-5 pt-3 border-t border-ice-200"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </Wrapper>
    </div>
  )
}
