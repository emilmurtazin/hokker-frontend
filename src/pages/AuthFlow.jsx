import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ShieldCheck, ChevronLeft, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

const ROLES = [
  { value: 'parent', label: 'Я родитель', hint: 'Ищу тренера и записываю ребёнка' },
  { value: 'coach', label: 'Я тренер', hint: 'Веду тренировки и учеников' },
  { value: 'arena_admin', label: 'Я администратор арены', hint: 'Публикую свободный лёд' },
]

function digitsOnly(value) {
  return value.replace(/\D/g, '')
}

export default function AuthFlow() {
  const { requestCode, verifyCode, register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('phone') // phone -> code -> register
  const [phoneDigits, setPhoneDigits] = useState('')
  const [requestId, setRequestId] = useState(null)
  const [code, setCode] = useState('')
  const [registrationToken, setRegistrationToken] = useState(null)
  const [role, setRole] = useState('parent')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [debugCode, setDebugCode] = useState(null) // видно только в local-окружении бэкенда
  const [smsWarning, setSmsWarning] = useState(null)

  async function handlePhoneSubmit(e) {
    e.preventDefault()
    setError(null)
    setSmsWarning(null)

    if (phoneDigits.length !== 10) {
      setError('Введите корректный номер телефона — 10 цифр после +7')
      return
    }

    setBusy(true)
    try {
      const data = await requestCode(`+7${phoneDigits}`)
      setRequestId(data.request_id)
      setDebugCode(data.debug_code || null)
      setSmsWarning(data.warning || null)
      setStep('code')
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не получилось отправить код')
    } finally {
      setBusy(false)
    }
  }

  async function handleCodeSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const data = await verifyCode(requestId, code)
      if (data.status === 'registration_required') {
        setRegistrationToken(data.registration_token)
        setStep('register')
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Неверный код')
    } finally {
      setBusy(false)
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await register(registrationToken, role, name, city || undefined)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не получилось завершить регистрацию')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-8 text-center">
          <img src="/logo-icon.png" alt="24hokker.ru" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-3xl font-semibold tracking-tight">24hokker.ru</h1>
          <p className="text-neutral-500 mt-1">Школа хоккея — тренеры, родители, арены</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-rink-900 mb-1.5">Номер телефона</span>
              <div className="relative flex items-center input-field pl-11 gap-1">
                <Phone className="absolute left-4 w-4 h-4 text-neutral-400" />
                <span className="text-neutral-500 select-none">+7</span>
                <input
                  type="tel"
                  required
                  autoFocus
                  inputMode="numeric"
                  placeholder="9991234567"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(digitsOnly(e.target.value).slice(0, 10))}
                  className="flex-1 bg-transparent outline-none min-w-0"
                />
              </div>
            </label>
            {error && <p className="text-action text-sm">{error}</p>}
            <button
              type="submit"
              disabled={busy || phoneDigits.length !== 10}
              className="btn-primary w-full"
            >
              {busy ? 'Отправляем код…' : 'Получить код'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="flex items-center gap-1 text-sm text-neutral-500 mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Изменить номер
            </button>

            {smsWarning && (
              <div className="flex items-start gap-2 bg-goal-light text-rink-900 rounded-card px-3.5 py-2.5 text-sm mb-1">
                <AlertTriangle className="w-4 h-4 text-goal shrink-0 mt-0.5" />
                <span>{smsWarning}</span>
              </div>
            )}

            <label className="block">
              <span className="block text-sm font-medium text-rink-900 mb-1.5">
                Код из SMS на +7{phoneDigits}
              </span>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="1234"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="input-field pl-11 tracking-[0.3em] font-stat text-lg"
                />
              </div>
              {debugCode && (
                <p className="text-xs text-neutral-400 mt-1.5">
                  Тестовый режим сервера: код {debugCode}
                </p>
              )}
            </label>
            {error && <p className="text-action text-sm">{error}</p>}
            <button type="submit" disabled={busy || !code} className="btn-primary w-full">
              {busy ? 'Проверяем…' : 'Подтвердить'}
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <span className="block text-sm font-medium text-rink-900 mb-2">Кто вы?</span>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3.5 rounded-card border cursor-pointer transition-colors ${
                      role === r.value
                        ? 'border-rink-900 bg-rink-900/[0.03]'
                        : 'border-ice-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-medium">{r.label}</span>
                      <span className="block text-sm text-neutral-500">{r.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-rink-900 mb-1.5">Имя</span>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Как к вам обращаться"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-rink-900 mb-1.5">Город</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                placeholder="Например, Москва"
              />
            </label>

            {error && <p className="text-action text-sm">{error}</p>}
            <button type="submit" disabled={busy || !name} className="btn-primary w-full">
              {busy ? 'Создаём аккаунт…' : 'Готово'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
