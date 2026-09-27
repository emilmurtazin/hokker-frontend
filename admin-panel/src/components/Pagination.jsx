export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-ice-200 text-sm text-neutral-500">
      <span>
        Всего: <span className="font-medium text-rink-900">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Назад
        </button>
        <span>
          Стр. {page} из {pages}
        </span>
        <button
          className="btn-secondary"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Вперёд
        </button>
      </div>
    </div>
  )
}
