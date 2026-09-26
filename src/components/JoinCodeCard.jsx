import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { apiRequest } from '../api/client'
import ConfirmModal from './ConfirmModal'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Разбивает «482913» на «482 913» — так число легче продиктовать и прочитать.
function spaced(code) {
  return `${code.slice(0, 3)} ${code.slice(3)}`
}

// Карточка постоянного кода тренера для самостоятельного присоединения
// родителей: POST /coaches/join. Показывается только тренеру — на экране
// «Ученики», рядом с остальными инструментами набора клиентов.
export default function JoinCodeCard({ profile, onProfileChanged }) {
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(profile.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер обмена недоступен — код всё равно виден на экране, его можно продиктовать.
    }
  }

  async function regenerate() {
    setBusy(true)
    setError(null)
    try {
      const updated = await apiRequest('/coaches/me/join-code/regenerate', { method: 'POST' })
      onProfileChanged(updated)
      setConfirming(false)
    } catch (err) {
      setError(err.detail || 'Не получилось обновить код')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card space-y-3">
      <div>
        <p className="font-medium text-sm">Код для клиентов</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          Продиктуйте или отправьте родителю — он введёт код в приложении и сам добавится в
          вашу базу учеников.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-1 text-center text-2xl font-display font-bold tracking-widest bg-ice-100 rounded-card py-3 text-rink-900">
          {spaced(profile.join_code)}
        </span>
        <button
          onClick={copyCode}
          aria-label="Скопировать код"
          className="shrink-0 h-full px-3.5 py-3 border border-ice-300 rounded-card text-neutral-600"
        >
          {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {profile.join_code_changed_at && (
        <p className="text-xs text-neutral-400">Действует с {formatDate(profile.join_code_changed_at)}</p>
      )}

      {error && <p className="text-action text-sm">{error}</p>}

      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-sm text-neutral-500"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Обновить код
      </button>

      {confirming && (
        <ConfirmModal
          title="Обновить код?"
          message="Старый код сразу перестанет работать — родители, которым вы его давали, больше не смогут добавиться по нему. Отправьте всем новый код."
          confirmLabel="Да, обновить"
          onConfirm={regenerate}
          onCancel={() => setConfirming(false)}
          busy={busy}
        />
      )}
    </div>
  )
}
