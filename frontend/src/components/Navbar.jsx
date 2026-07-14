import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCheck, faBars, faMaximize, faEllipsis, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

export default function Navbar({ onMenuClick, selectedModel, onModelSelect }) {
  const { t, i18n } = useTranslation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)

  const models = [
    { id: 'cosmo-v1', name: t('models.cosmoV1'), desc: t('models.cosmoV1Desc') },
    { id: 'cosmo-pro', name: t('models.cosmoPro'), desc: t('models.cosmoProDesc') },
    { id: 'minilm', name: t('models.miniLM'), desc: t('models.miniLMDesc') },
  ]

  const languages = [
    { code: 'en', label: t('languages.en') },
    { code: 'fr', label: t('languages.fr') },
    { code: 'es', label: t('languages.es') },
    { code: 'de', label: t('languages.de') },
    { code: 'hi', label: t('languages.hi') },
    { code: 'zh', label: t('languages.zh') },
    { code: 'ja', label: t('languages.ja') },
  ]

  const changeLanguage = (code) => {
    i18n.changeLanguage(code)
    setLanguageOpen(false)
  }

  return (
    <header className="flex items-center justify-between border-b border-dark-border bg-dark-bg px-4 py-2.5 z-10 animate-fade-in-up">
      {/* Left items */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors"
          title="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Model Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-gray-300 hover:bg-dark-card transition-colors text-sm font-semibold"
          >
            <span>{models.find(m => m.id === selectedModel)?.name || selectedModel}</span>
            <FontAwesomeIcon icon={faChevronDown} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-dark-border bg-dark-card p-2 shadow-2xl z-40 animate-fade-in">
                <div className="px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {t('navbar.selectModel')}
                </div>
                <div className="mt-1 space-y-1">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelSelect(model.id)
                        setDropdownOpen(false)
                      }}
                      className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-dark-bg transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-white">{model.name}</span>
                        {selectedModel === model.id && <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />}
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
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors"
            title={t('navbar.language')}
          >
            <FontAwesomeIcon icon={faGlobe} />
          </button>

          {languageOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setLanguageOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-dark-border bg-dark-card p-1.5 shadow-2xl z-40 animate-fade-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      i18n.language === lang.code
                        ? 'text-emerald-400 bg-dark-bg'
                        : 'text-gray-300 hover:bg-dark-bg hover:text-white'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && <FontAwesomeIcon icon={faCheck} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors" title={t('navbar.fullScreen')}>
          <FontAwesomeIcon icon={faMaximize} />
        </button>
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-dark-card hover:text-white transition-colors" title={t('navbar.moreOptions')}>
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>
    </header>
  )
}
