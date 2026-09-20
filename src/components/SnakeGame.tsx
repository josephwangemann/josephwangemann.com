import { useEffect, useState } from 'react'
import { useSnakeGame, type FoodPulse } from '../hooks/useSnakeGame'
import { SnakeControlsHint } from './SnakeControlsHint'
import { GameOverControls } from './GameOverControls'

type SnakeGameProps = { gameStartDelay: number; isReady: boolean; onFoodEaten: (pulse: FoodPulse) => void }

export function SnakeGame({ gameStartDelay, isReady, onFoodEaten }: SnakeGameProps) {
  const [isEntering, setIsEntering] = useState(false)
  const game = useSnakeGame(isReady, gameStartDelay, onFoodEaten)

  useEffect(() => {
    if (!isReady) return

    setIsEntering(true)
    const timer = window.setTimeout(() => setIsEntering(false), 500)
    return () => window.clearTimeout(timer)
  }, [isReady])

  if (!isReady) return null

  if (!game.isSnakeVisible) {
    return (
      <button
        type="button"
        onClick={game.reopenSnake}
        aria-label="Show Snake"
        className="absolute top-6 right-6 z-10 grid size-9 place-items-center rounded-full border border-[#74c900] bg-[#07090d]/70 text-[#d9ff7a] transition-colors hover:bg-[#74c900] hover:text-[#07090d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path d="M4 7h8a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h2M18 17l2-2m-2 2 2 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      </button>
    )
  }

  return (
    <>
      <div className="snake-stage absolute inset-5 z-0 md:inset-8">
        <div
          ref={game.boardRef}
          className={`snake-board absolute inset-0 touch-none overflow-hidden rounded-2xl select-none ${isEntering ? 'snake-enter' : ''} ${game.isGameOver ? 'snake-game-over' : ''}`}
          onTouchEnd={game.handleTouchEnd}
          onTouchStart={game.handleTouchStart}
        >
          <canvas
            ref={game.canvasRef}
            width={game.boardSize.width}
            height={game.boardSize.height}
            className="size-full"
            aria-label="Snake game. Use arrow keys or swipe to control the snake."
          />
          <canvas
            ref={game.reactionsRef}
            aria-hidden="true"
            className="snake-reactions pointer-events-none absolute inset-0 size-full"
          />
          <div className="absolute top-5 left-5 z-10 font-['Press_Start_2P',monospace] text-[0.55rem] leading-relaxed text-neutral-400 drop-shadow-md">
            <span ref={game.highScoreLabelRef} className="block">High Score</span>
            <span className="text-[0.9rem] text-neutral-200">{game.highScore}</span>
            <span className="mt-3 block">Score</span>
            <span className="text-[0.9rem] text-neutral-200">{game.score}</span>
          </div>
          {game.showControlsHint && <SnakeControlsHint isMobile={game.isMobile} />}
        </div>
      </div>
      {game.isGameOver && (
        <GameOverControls
          action={game.gameOverAction}
          onHide={game.hideSnake}
          onRestart={game.restartGame}
        />
      )}
    </>
  )
}
