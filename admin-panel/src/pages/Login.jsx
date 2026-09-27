import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

function normalizePhone(v) {
  return v.replace(/[^\d+]/g, '')
}

export default function Login() {
  const { requestCode, verifyCode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState('phone') // 'phone' | 'code'
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [requestId, setRequestId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleRequestCode(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await requestCode(normalizePhone(phone))
      setRequestId(data.request_id)
      setStep('code')
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось отправить код')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await verifyCode(requestId, code)
      const dest = location.state?.from?.pathname || '/'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rink-900 flex items-center justify-center p-6">
      <div className="card w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="font-display font-bold text-2xl text-rink-900">24HOKKER</div>
          <div className="text-sm text-neutral-500 mt-1">Панель администратора</div>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleRequestCode} className="space-y-3">
            <label className="block text-sm font-medium text-neutral-500">Номер телефона</label>
            <input
              className="input-field"
              placeholder="+7 900 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="text-sm text-action">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Отправляем…' : 'Получить код'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <label className="block text-sm font-medium text-neutral-500">Код из SMS</label>
            <input
              className="input-field tracking-widest text-center text-lg"
              placeholder="••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="text-sm text-action">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Входим…' : 'Войти'}
            </button>
            <button
              type="button"
              className="text-sm text-neutral-500 hover:text-rink-900 w-full text-center"
              onClick={() => {
                setStep('phone')
                setError(null)
                setCode('')
              }}
            >
              Изменить номер
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
