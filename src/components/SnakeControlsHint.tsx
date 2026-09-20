type SnakeControlsHintProps = { isMobile: boolean }

export function SnakeControlsHint({ isMobile }: SnakeControlsHintProps) {
  if (isMobile) {
    return (
      <span className="absolute top-5 right-5 z-10 font-['Press_Start_2P',monospace] text-[0.7rem] leading-relaxed text-neutral-200 drop-shadow-md">
        Swipe to move
      </span>
    )
  }

  return (
    <div className="absolute top-5 right-5 z-10 flex flex-col items-center gap-2 text-neutral-200 drop-shadow-md">
      <div className="grid grid-cols-3 grid-rows-2 gap-1 text-center font-['Press_Start_2P',monospace] text-[0.7rem] leading-none">
        <span className="col-start-2 row-start-1 grid size-10 place-items-center rounded-sm border border-white/25">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M12 19V5m0 0-5 5m5-5 5 5" fill="none" stroke="currentColor" strokeLinecap="square" strokeWidth="2.5" />
          </svg>
        </span>
        <span className="col-start-1 row-start-2 grid size-10 place-items-center rounded-sm border border-white/25">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M19 12H5m0 0 5-5m-5 5 5 5" fill="none" stroke="currentColor" strokeLinecap="square" strokeWidth="2.5" />
          </svg>
        </span>
        <span className="col-start-2 row-start-2 grid size-10 place-items-center rounded-sm border border-white/25">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M12 5v14m0 0-5-5m5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="square" strokeWidth="2.5" />
          </svg>
        </span>
        <span className="col-start-3 row-start-2 grid size-10 place-items-center rounded-sm border border-white/25">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M5 12h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="square" strokeWidth="2.5" />
          </svg>
        </span>
      </div>
      <span className="font-['Press_Start_2P',monospace] text-[0.8rem] leading-relaxed">Use arrow keys</span>
    </div>
  )
}
