import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  title = 'Подтвердите действие',
  message,
  confirmLabel = 'Да, удалить',
  cancelLabel = 'Отмена',
  danger = true,
  onConfirm,
  onCancel,
  busy = false,
}) {
  return (
    <div className="fixed inset-0 bg-rink-900/40 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              danger ? 'bg-action-light' : 'bg-goal-light'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-action' : 'text-goal'}`} />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            {message && <p className="text-sm text-neutral-500 mt-1">{message}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel} disabled={busy} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-card px-5 py-3 font-medium text-white transition-colors ${
              danger ? 'bg-action active:bg-action-hover' : 'bg-rink-900 active:bg-rink-800'
            } disabled:opacity-40`}
          >
            {busy ? 'Подождите…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
