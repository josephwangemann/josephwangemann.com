import type { ColorMode } from '../hooks/useSnakeGame'

type GameOverControlsProps = {
  action: 'restart' | 'hide'
  colorMode: ColorMode
  onHide: () => void
  onRestart: () => void
}

const accentClass: Record<ColorMode, { selected: string; idle: string }> = {
  dusk: { selected: 'border-[#70b7f5] bg-[#70b7f5]', idle: 'hover:border-[#70b7f5]' },
  midnight: { selected: 'border-[#70b7f5] bg-[#70b7f5]', idle: 'hover:border-[#70b7f5]' },
  aurora: { selected: 'border-[#77e9c7] bg-[#77e9c7]', idle: 'hover:border-[#77e9c7]' },
  dawn: { selected: 'border-[#ffc27d] bg-[#ffc27d]', idle: 'hover:border-[#ffc27d]' },
}

const buttonClass = (selected: boolean, colorMode: ColorMode) => {
  const accent = accentClass[colorMode] ?? accentClass.dusk
  return `rounded-full border px-5 py-3 font-['Press_Start_2P',monospace] text-[0.65rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100 ${
    selected
      ? `${accent.selected} text-[#07090d]`
      : `border-white/25 bg-[#07090d]/90 text-neutral-300 ${accent.idle} hover:text-neutral-100`
  }`
}

export function GameOverControls({ action, colorMode, onHide, onRestart }: GameOverControlsProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3">
      <button type="button" onClick={onRestart} className={buttonClass(action === 'restart', colorMode)}>
        Restart
      </button>
      <button type="button" onClick={onHide} className={buttonClass(action === 'hide', colorMode)}>
        Hide Snake
      </button>
    </div>
  )
}
