export default function ComingSoon({ title }) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-ice-300 mx-auto mb-4 flex items-center justify-center">
        <span className="text-2xl">🥅</span>
      </div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-neutral-500 text-sm">Этот экран появится на следующем шаге разработки.</p>
    </div>
  )
}
