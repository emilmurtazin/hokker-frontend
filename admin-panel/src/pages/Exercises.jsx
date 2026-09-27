import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const CATEGORY_LABELS = {
  skating: 'Катание',
  stickhandling: 'Владение клюшкой',
  shooting: 'Бросок',
  strength: 'ОФП',
  goalie: 'Вратарь',
  game: 'Игровое',
}
const LOCATION_LABELS = { on_ice: 'На льду', gym: 'В зале', off_ice: 'Вне льда' }
const AGE_GROUPS = ['6-9', '10-12', '13+']

const EMPTY_FORM = {
  code: '',
  title: '',
  category: 'skating',
  location: 'on_ice',
  age_group: '6-9',
  content_status: 'draft',
  description: '',
  players_text: '',
  duration_text: '',
  equipment_text: '',
  needs_puck: false,
  steps: '',
  coach_tips: '',
  simplify_tips: '',
  complicate_tips: '',
  qualities: '',
  hockey_connection: '',
  video_url: '',
  image_url: '',
}

function toLines(v) {
  return (v || []).join('\n')
}
function fromLines(v) {
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function Exercises() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | exercise object
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  function refresh() {
    apiRequest('/exercises?limit=200')
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить упражнения'))
  }

  useEffect(refresh, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing('new')
  }

  function openEdit(ex) {
    setForm({
      code: ex.code || '',
      title: ex.title,
      category: ex.category,
      location: ex.location,
      age_group: ex.age_group,
      content_status: ex.content_status,
      description: ex.description || '',
      players_text: ex.players_text || '',
      duration_text: ex.duration_text || '',
      equipment_text: ex.equipment_text || '',
      needs_puck: !!ex.needs_puck,
      steps: toLines(ex.steps),
      coach_tips: toLines(ex.coach_tips),
      simplify_tips: toLines(ex.simplify_tips),
      complicate_tips: toLines(ex.complicate_tips),
      qualities: toLines(ex.qualities),
      hockey_connection: ex.hockey_connection || '',
      video_url: ex.video_url || '',
      image_url: ex.image_url || '',
    })
    setEditing(ex)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const body = {
      code: form.code || null,
      title: form.title,
      category: form.category,
      location: form.location,
      age_group: form.age_group,
      content_status: form.content_status,
      description: form.description || null,
      players_text: form.players_text || null,
      duration_text: form.duration_text || null,
      equipment_text: form.equipment_text || null,
      needs_puck: form.needs_puck,
      steps: fromLines(form.steps),
      coach_tips: fromLines(form.coach_tips),
      simplify_tips: fromLines(form.simplify_tips),
      complicate_tips: fromLines(form.complicate_tips),
      qualities: fromLines(form.qualities),
      hockey_connection: form.hockey_connection || null,
      video_url: form.video_url || null,
      image_url: form.image_url || null,
    }
    try {
      if (editing === 'new') {
        await apiRequest('/admin/exercises', { method: 'POST', body })
      } else {
        await apiRequest(`/admin/exercises/${editing.id}`, { method: 'PATCH', body })
      }
      setEditing(null)
      refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось сохранить упражнение')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await apiRequest(`/admin/exercises/${toDelete.id}`, { method: 'DELETE' })
      setToDelete(null)
      refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось удалить упражнение')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'code', header: 'Код', render: (r) => r.code || '—' },
    { key: 'title', header: 'Название' },
    { key: 'category', header: 'Категория', render: (r) => CATEGORY_LABELS[r.category] || r.category },
    { key: 'location', header: 'Где', render: (r) => LOCATION_LABELS[r.location] || r.location },
    { key: 'age_group', header: 'Возраст' },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <Badge color={r.content_status === 'complete' ? 'green' : 'yellow'}>{r.content_status === 'complete' ? 'Готово' : 'Черновик'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </button>
          <button className="btn-danger" onClick={() => setToDelete(r)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Упражнения" subtitle="Библиотека видеоупражнений ОФП">
        <button className="btn-primary flex items-center gap-1" onClick={openCreate}>
          <Plus size={16} /> Добавить
        </button>
      </PageHeader>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card">
        <Table columns={columns} rows={items || []} empty={items === null ? 'Загрузка…' : 'Упражнений пока нет'} />
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Новое упражнение' : `Редактирование: ${editing.title}`} onClose={() => setEditing(null)} width="max-w-2xl">
          <form onSubmit={save} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Код</label>
                <input className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ОФП-01" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Название *</label>
                <input className="input-field" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Категория</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Где</label>
                <select className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                  {Object.entries(LOCATION_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Возраст</label>
                <select className="input-field" value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })}>
                  {AGE_GROUPS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Статус</label>
                <select className="input-field" value={form.content_status} onChange={(e) => setForm({ ...form, content_status: e.target.value })}>
                  <option value="draft">Черновик</option>
                  <option value="complete">Готово</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Описание</label>
              <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Игроков</label>
                <input className="input-field" value={form.players_text} onChange={(e) => setForm({ ...form, players_text: e.target.value })} placeholder="1-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Длительность</label>
                <input className="input-field" value={form.duration_text} onChange={(e) => setForm({ ...form, duration_text: e.target.value })} placeholder="10 мин" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Инвентарь</label>
                <input className="input-field" value={form.equipment_text} onChange={(e) => setForm({ ...form, equipment_text: e.target.value })} placeholder="Шайбы, конусы" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.needs_puck} onChange={(e) => setForm({ ...form, needs_puck: e.target.checked })} />
              Нужна шайба
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Шаги выполнения (по одному в строке)</label>
                <textarea className="input-field" rows={4} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Советы тренеру (по одному в строке)</label>
                <textarea className="input-field" rows={4} value={form.coach_tips} onChange={(e) => setForm({ ...form, coach_tips: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Как упростить (по одному в строке)</label>
                <textarea className="input-field" rows={3} value={form.simplify_tips} onChange={(e) => setForm({ ...form, simplify_tips: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Как усложнить (по одному в строке)</label>
                <textarea className="input-field" rows={3} value={form.complicate_tips} onChange={(e) => setForm({ ...form, complicate_tips: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Качества (по одному в строке)</label>
              <textarea className="input-field" rows={2} value={form.qualities} onChange={(e) => setForm({ ...form, qualities: e.target.value })} placeholder="Координация&#10;Баланс" />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Связь с хоккеем</label>
              <textarea className="input-field" rows={2} value={form.hockey_connection} onChange={(e) => setForm({ ...form, hockey_connection: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Ссылка на видео</label>
                <input className="input-field" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Ссылка на картинку</label>
                <input className="input-field" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
                Отмена
              </button>
              <button className="btn-primary" disabled={saving}>
                {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Удалить упражнение?"
          message={`«${toDelete.title}» будет удалено безвозвратно.`}
          confirmLabel="Удалить"
          danger
          loading={saving}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
