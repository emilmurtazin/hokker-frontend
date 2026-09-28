import { Search, TrendingUp, Dumbbell, Snowflake, Bell, Check, ChevronUp } from 'lucide-react'

/*
  Лендинг на странице входа/регистрации: 4 блока с преимуществами. Картинки не
  нужны — «окна приложения» нарисованы теми же компонентами и стилями, что и
  настоящие экраны (card, jersey-stat, цвета бренда), с вымышленными данными.
  Это лёгкий вес (без скриншотов в PWA-кэше) и всегда актуальный внешний вид.
*/

function PhoneFrame({ label, children }) {
  return (
    <figure className="mx-auto w-full max-w-[300px]">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none rounded-[26px] border-[5px] border-rink-900 bg-ice-100 overflow-hidden shadow-lg"
      >
        <div className="bg-rink-900 text-white text-[10px] tracking-wide px-4 py-1.5 flex items-center justify-between">
          <span className="font-display">24HOKKER.RU</span>
          <span className="opacity-60">пример</span>
        </div>
        <div className="p-3 space-y-2.5">{children}</div>
      </div>
      <figcaption className="text-center text-xs text-neutral-400 mt-2">{label}</figcaption>
    </figure>
  )
}

/* ---------- Макеты экранов (данные вымышленные) ---------- */

function MockCatalog() {
  return (
    <PhoneFrame label="Ближайшие тренировки в вашем городе">
      <div className="flex gap-1.5">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-rink-900 text-white">Тренировки</span>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-ice-300">Тренеры</span>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-ice-300">6-9</span>
      </div>
      {[
        { t: 'Лёд', d: 'Сб, 4 окт, 10:00 · 1 ч', c: 'Алексей Смирнов · Арена «Север»', p: '800 ₽ с человека', seats: '5 / 12 мест', btn: 'Записаться', full: false },
        { t: 'ОФП', d: 'Вс, 5 окт, 09:00 · 1 ч', c: 'Марина Орлова · Зал «Старт»', p: '500 ₽ с человека', seats: '8 / 8 мест', btn: 'В лист ожидания', full: true },
      ].map((s) => (
        <div key={s.t} className="card !p-3">
          <p className="text-sm font-medium">{s.t}</p>
          <p className="text-xs text-neutral-500">{s.d}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Тренер: {s.c}</p>
          <p className="text-[11px] text-rink-700 font-medium mt-0.5">{s.p}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-neutral-500">{s.seats}</span>
            <span className={`py-1 px-2.5 text-[11px] rounded-card font-medium ${s.full ? 'bg-ice-200 text-neutral-600' : 'bg-action text-white'}`}>
              {s.btn}
            </span>
          </div>
        </div>
      ))}
    </PhoneFrame>
  )
}

function MockProgress() {
  const skills = [
    ['Катание', 4.4],
    ['Владение клюшкой', 3.8],
    ['Бросок', 3.5],
    ['Тактика', 3.0],
    ['Дисциплина', 4.8],
  ]
  return (
    <PhoneFrame label="Паспорт хоккеиста: оценки тренеров">
      <div className="card !p-3">
        <p className="text-sm font-semibold mb-2">Паспорт хоккеиста</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['4.1', 'Средний балл'], ['24', 'Тренировок'], ['92%', 'Посещаемость']].map(([v, l]) => (
            <div key={l}>
              <div className="jersey-stat w-full h-9 text-base">{v}</div>
              <p className="text-[10px] text-neutral-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card !p-3 space-y-2">
        <p className="text-sm font-semibold">Навыки</p>
        {skills.map(([name, v]) => (
          <div key={name}>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span>{name}</span>
              <span className="font-medium text-neutral-500">{v.toFixed(1)}</span>
            </div>
            <div className="h-1.5 bg-ice-200 rounded-full overflow-hidden">
              <div className="h-full bg-action rounded-full" style={{ width: `${(v / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="card !p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs">Катание</p>
            <p className="text-[10px] text-neutral-400">Уверенно держит поворот, работаем над стартом</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-neutral-400">28 сент.</span>
            <span className="jersey-stat w-6 h-6 text-xs">5</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

function MockExercise() {
  return (
    <PhoneFrame label="Упражнение от тренера — домой, в Telegram">
      <div className="card !p-3">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {['ОФП', '6-9', 'В зале', '10 мин'].map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-ice-200 text-neutral-600">{t}</span>
          ))}
        </div>
        <p className="text-sm font-semibold">Прыжки через конусы</p>
        <p className="text-[11px] text-neutral-500 mt-0.5">Развивает координацию и взрывную силу ног.</p>
        <ol className="text-[11px] text-neutral-600 mt-2 space-y-0.5 list-decimal pl-4">
          <li>Расставьте 5 конусов в ряд</li>
          <li>Прыгайте на двух ногах через каждый</li>
          <li>Вернитесь и повторите 3 раза</li>
        </ol>
      </div>
      <div className="flex items-start gap-2 bg-goal-light rounded-card px-3 py-2">
        <Bell className="w-3.5 h-3.5 text-goal shrink-0 mt-0.5" />
        <p className="text-[11px] text-rink-900">Тренер: «Сделайте 3 подхода до пятницы» — пришло в Telegram</p>
      </div>
    </PhoneFrame>
  )
}

function MockIce() {
  const rows = [
    ['Сб, 4 окт · 10:00–11:00', 'Полный лёд · 6 000 ₽', 'Подтверждена', 'text-green-700 bg-green-50'],
    ['Вс, 5 окт · 12:00–13:00', 'Половина льда · 3 200 ₽', 'Ждёт решения арены', 'text-goal bg-goal-light'],
    ['Пн, 6 окт · 19:00–20:00', 'Треть льда · 2 000 ₽', 'Свободен', 'text-rink-700 bg-ice-200'],
  ]
  return (
    <PhoneFrame label="Аренда льда: заявка и статус">
      {rows.map(([when, what, status, cls]) => (
        <div key={when} className="card !p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium">{when}</p>
              <p className="text-[11px] text-neutral-500">{what}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${cls}`}>{status}</span>
          </div>
        </div>
      ))}
    </PhoneFrame>
  )
}

/* ---------- Блоки ---------- */

function Block({ icon: Icon, title, text, points, mock, accent = false, reverse = false, badge }) {
  return (
    <section
      className={`rounded-2xl px-5 py-7 md:px-8 ${
        accent ? 'bg-rink-900 text-white' : 'bg-white border border-ice-200 shadow-sm'
      }`}
    >
      <div className={`grid gap-7 md:grid-cols-2 md:items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
        <div>
          {badge && (
            <span className="inline-block text-[11px] font-semibold tracking-wide uppercase bg-goal text-rink-900 rounded-full px-2.5 py-1 mb-3">
              {badge}
            </span>
          )}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              accent ? 'bg-white/10 text-goal' : 'bg-action-light text-action'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
          <p className={`mt-2 text-sm ${accent ? 'text-white/75' : 'text-neutral-500'}`}>{text}</p>
          <ul className="mt-4 space-y-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${accent ? 'text-goal' : 'text-action'}`} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>{mock}</div>
      </div>
    </section>
  )
}

export default function Landing({ onStart }) {
  return (
    <div id="about" className="px-5 pb-12 pt-4">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-semibold tracking-tight">Хоккей для ребёнка — под контролем</h2>
          <p className="text-neutral-500 mt-1.5">
            Тренеры, расписание и результаты — в одном приложении
          </p>
        </div>

        <Block
          icon={Search}
          title="Найдите тренера и запишитесь за минуту"
          text="Смотрите ближайшие тренировки в своём городе, выбирайте по возрасту и направлению и записывайте ребёнка в пару касаний."
          points={[
            'Фильтры по городу, возрасту ребёнка и типу тренировки',
            'Если мест нет — встанете в лист ожидания и получите приглашение, когда место освободится',
            'Напоминание о тренировке придёт заранее (в Telegram)',
          ]}
          mock={<MockCatalog />}
        />

        <Block
          accent
          badge="Главное для родителей"
          icon={TrendingUp}
          title="Вы видите прогресс ребёнка"
          text="После тренировок тренер выставляет оценки по ключевым навыкам. Вы всегда видите, как растёт ваш хоккеист — без вопросов «ну как там?»."
          points={[
            'Оценки тренеров от 1 до 5: катание, клюшка, бросок, тактика, дисциплина',
            'Комментарии тренера к оценкам и история изменений',
            'Средний балл, число тренировок и посещаемость в одном паспорте',
          ]}
          mock={<MockProgress />}
          reverse
        />

        <Block
          icon={Dumbbell}
          title="Упражнения для занятий дома"
          text="Библиотека упражнений ОФП с описанием и видео. Тренер может отправить нужное упражнение вашему ребёнку прямо в Telegram."
          points={[
            'Понятные шаги, инвентарь и время выполнения',
            'Советы, как упростить или усложнить упражнение',
            'Личное сообщение тренера вместе с заданием',
          ]}
          mock={<MockExercise />}
        />

        <Block
          icon={Snowflake}
          title="Тренерам и аренам — порядок в расписании"
          text="Тренер ведёт учеников, посещаемость и оценки, а лёд бронирует онлайн. Арена публикует свободные слоты и решает по заявкам."
          points={[
            'Список учеников, группы и отметка посещаемости',
            'Заявки на лёд с понятными статусами',
            'Уведомления о записях и отменах в Telegram',
          ]}
          mock={<MockIce />}
          reverse
        />

        <div className="text-center pt-3">
          <button type="button" onClick={onStart} className="btn-primary inline-flex items-center gap-2">
            <ChevronUp className="w-4 h-4" />
            Войти или зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
}
