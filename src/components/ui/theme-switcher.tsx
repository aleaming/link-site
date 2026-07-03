import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Shuffle, Palette as PaletteIcon, Check } from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { THEMES, PALETTE_KEYS, randomPaletteKey, type ThemeMode } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  paletteKey: string
  mode: ThemeMode
  onPaletteChange: (key: string) => void
}

export function ThemeSwitcher({ paletteKey, mode, onPaletteChange }: ThemeSwitcherProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleRandomize = () => {
    const next = randomPaletteKey(paletteKey)
    onPaletteChange(next)
    setToast(`🎲 ${THEMES[next].name}`)
    window.setTimeout(() => setToast(null), 1800)
  }

  const handlePick = (key: string) => {
    onPaletteChange(key)
    setPickerOpen(false)
  }

  return (
    <div className="relative flex items-center gap-1">
      <GlowButton
        variant="ghost"
        size="icon"
        onClick={handleRandomize}
        aria-label="Randomize theme"
        title="Randomize theme"
      >
        <Shuffle size={18} />
      </GlowButton>

      <GlowButton
        variant="ghost"
        size="icon"
        onClick={() => setPickerOpen((open) => !open)}
        aria-label="Choose theme"
        title="Choose theme"
        aria-expanded={pickerOpen}
      >
        <PaletteIcon size={18} />
      </GlowButton>

      <AnimatePresence>
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-line bg-surface shadow-elevated p-2"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {PALETTE_KEYS.map((key) => {
                const swatch = THEMES[key][mode]
                const isActive = key === paletteKey
                return (
                  <button
                    key={key}
                    onClick={() => handlePick(key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive ? 'bg-elevated text-fg' : 'text-fg-secondary hover:bg-elevated'
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-line-secondary shrink-0"
                      style={{ backgroundColor: swatch.accentPrimary }}
                    />
                    <span className="flex-1 text-left truncate">{THEMES[key].name}</span>
                    {isActive && <Check size={14} />}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="absolute right-0 top-full mt-2 z-50 px-3 py-1.5 rounded-lg bg-elevated border border-line text-sm text-fg shadow-elevated whitespace-nowrap"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
