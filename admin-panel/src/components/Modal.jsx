import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, width = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-rink-900/40 p-6">
      <div className={`card w-full ${width} mt-10 mb-10`}>
        <div className="flex items-center justify-between border-b border-ice-200 px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-rink-900">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
