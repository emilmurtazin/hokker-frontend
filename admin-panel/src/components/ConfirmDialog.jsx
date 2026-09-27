import Modal from './Modal'

export default function ConfirmDialog({ title, message, confirmLabel = 'Подтвердить', danger, onConfirm, onCancel, loading }) {
  return (
    <Modal title={title} onClose={onCancel} width="max-w-sm">
      <p className="text-sm text-neutral-500 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>
          Отмена
        </button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
          {loading ? 'Подождите…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
