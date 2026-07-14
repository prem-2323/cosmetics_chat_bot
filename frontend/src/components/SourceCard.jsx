import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

export default function SourceCard({ title }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 text-sm text-gray-300 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm">
      <FontAwesomeIcon icon={faBookOpen} className="text-gray-400" />
      <span>{title}</span>
    </div>
  )
}
