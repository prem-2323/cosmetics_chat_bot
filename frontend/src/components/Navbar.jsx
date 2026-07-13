import { useState } from 'react'
import { ChevronDown, Sparkles, Check, Sidebar, Maximize2, MoreHorizontal } from 'lucide-react'

export default function Navbar({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState('CosmoGPT v1.0')

  const models = [
    { name: 'CosmoGPT v1.0', desc: 'Default cosmetics RAG bot, fast & accurate.' },
    { name: 'CosmoGPT Pro', desc: 'Deep-diving formulation & safety analysis.' },
    { name: 'MiniLM-L6-v2', desc: 'Fast embedding retrieval.' },
  ]

  return (
    <header className="flex items-center justify-between border-b border-dark-border bg-dark-bg px-4 py-2.5 z-10">
      {/* Left items */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors"
          title="Toggle sidebar"
        >
          <Sidebar size={18} />
        </button>

        {/* Model Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-gray-300 hover:bg-dark-card transition-colors text-sm font-semibold"
          >
            <span>{selectedModel}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-dark-border bg-dark-card p-2 shadow-2xl z-40">
                <div className="px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Select Model
                </div>
                <div className="mt-1 space-y-1">
                  {models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => {
                        setSelectedModel(model.name)
                        setDropdownOpen(false)
                      }}
                      className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-dark-bg transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-white">{model.name}</span>
                        {selectedModel === model.name && <Check size={14} className="text-purple-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                        {model.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-1.5">
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors" title="Full screen">
          <Maximize2 size={16} />
        </button>
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors" title="More options">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </header>
  )
}
