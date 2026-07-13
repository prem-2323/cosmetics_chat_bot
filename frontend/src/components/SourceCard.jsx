import { BookOpen } from 'lucide-react'

export default function SourceCard({ title }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 text-sm text-gray-300 hover:border-primary/50 transition-colors">
      <BookOpen size={14} className="text-primary" />
      <span>{title}</span>
    </div>
  )
}
