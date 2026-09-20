type GameOverControlsProps = {
  action: 'restart' | 'hide'
  onHide: () => void
  onRestart: () => void
}

const buttonClass = (selected: boolean) =>
  `rounded-full border px-5 py-3 font-['Press_Start_2P',monospace] text-[0.65rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100 ${
    selected
      ? 'border-[#70b7f5] bg-[#70b7f5] text-[#07090d]'
      : 'border-white/25 bg-[#07090d]/90 text-neutral-300 hover:border-[#70b7f5] hover:text-neutral-100'
  }`

export function GameOverControls({ action, onHide, onRestart }: GameOverControlsProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3">
      <button type="button" onClick={onRestart} className={buttonClass(action === 'restart')}>
        Restart
      </button>
      <button type="button" onClick={onHide} className={buttonClass(action === 'hide')}>
        Hide Snake
      </button>
    </div>
  )
}
