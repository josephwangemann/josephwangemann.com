import sunriseAvatar from './assets/sunrise-avatar.jpeg'
import { useEffect, useRef, useState, type TouchEvent } from 'react'

const greeting = 'Hi! Joseph Wangemann here.'
const salutation = 'Hi!'
const introduction = 'Joseph Wangemann here.'
const initialBoardSize = { height: 18, width: 28 }
const titleRevealDuration = 1_350
const socialRevealAt = titleRevealDuration + 350
const snakeRevealAt = socialRevealAt + 1_150
const gameStartDelay = snakeRevealAt + 700
const mobileMediaQuery = '(max-width: 767px)'

type Position = { x: number; y: number }
type Direction = { x: number; y: number }
type BoardSize = { height: number; width: number }
type Game = {
  boardSize: BoardSize
  direction: Direction
  food: Position
  isOver: boolean
  score: number
  snake: Position[]
}

const directions: Record<string, Direction> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

function positionsMatch(first: Position, second: Position) {
  return first.x === second.x && first.y === second.y
}

function createFood(snake: Position[], boardSize: BoardSize): Position {
  let food: Position

  do {
    food = {
      x: Math.floor(Math.random() * boardSize.width),
      y: Math.floor(Math.random() * boardSize.height),
    }
  } while (snake.some((segment) => positionsMatch(segment, food)))

  return food
}

function createGame(boardSize: BoardSize): Game {
  const centerX = Math.floor(boardSize.width / 2)
  const centerY = Math.floor(boardSize.height / 2)
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ]

  return {
    snake,
    boardSize,
    direction: directions.ArrowRight,
    food: createFood(snake, boardSize),
    isOver: false,
    score: 0,
  }
}

function drawGame(
  canvas: HTMLCanvasElement | null,
  game: Game,
  time = performance.now(),
) {
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  context.clearRect(0, 0, game.boardSize.width, game.boardSize.height)

  context.strokeStyle = 'rgba(112, 183, 245, 0.08)'
  context.lineWidth = 0.03
  for (let x = 0; x <= game.boardSize.width; x += 1) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, game.boardSize.height)
    context.stroke()
  }
  for (let y = 0; y <= game.boardSize.height; y += 1) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(game.boardSize.width, y)
    context.stroke()
  }

  context.fillStyle = '#ff4f7b'
  const foodSize = 0.58 + Math.sin(time / 150) * 0.22
  context.fillRect(
    game.food.x + (1 - foodSize) / 2,
    game.food.y + (1 - foodSize) / 2,
    foodSize,
    foodSize,
  )

  game.snake.forEach((segment, index) => {
    context.fillStyle = index === 0 ? '#d9ff7a' : '#74c900'
    context.fillRect(segment.x + 0.12, segment.y + 0.12, 0.76, 0.76)
  })
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [boardSize, setBoardSize] = useState<BoardSize>(initialBoardSize)
  const gameRef = useRef<Game>(createGame(initialBoardSize))
  const touchStartRef = useRef<Position | null>(null)
  const gameStartAtRef = useRef(performance.now() + gameStartDelay)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isSnakeVisible, setIsSnakeVisible] = useState(true)
  const [showSocials, setShowSocials] = useState(false)
  const [showSnake, setShowSnake] = useState(false)
  const [isSnakeEntering, setIsSnakeEntering] = useState(false)
  const [showControlsHint, setShowControlsHint] = useState(true)
  const [gameOverAction, setGameOverAction] = useState<'restart' | 'hide'>('restart')
  const [highScore, setHighScore] = useState(0)
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(mobileMediaQuery).matches,
  )

  const restartGame = () => {
    gameRef.current = createGame(boardSize)
    setIsGameOver(false)
    setGameOverAction('restart')
    drawGame(canvasRef.current, gameRef.current)
  }

  const reopenSnake = () => {
    restartGame()
    setIsSnakeVisible(true)
  }

  const hideSnake = () => {
    setIsSnakeVisible(false)
  }

  const changeDirection = (nextDirection: Direction) => {
    const currentDirection = gameRef.current.direction

    if (
      nextDirection.x !== -currentDirection.x ||
      nextDirection.y !== -currentDirection.y
    ) {
      gameRef.current.direction = nextDirection
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    const touch = event.changedTouches[0]
    touchStartRef.current = null
    if (!start || !touch) return

    const horizontalDistance = touch.clientX - start.x
    const verticalDistance = touch.clientY - start.y
    if (Math.max(Math.abs(horizontalDistance), Math.abs(verticalDistance)) < 24) return

    const direction =
      Math.abs(horizontalDistance) > Math.abs(verticalDistance)
        ? horizontalDistance > 0
          ? directions.ArrowRight
          : directions.ArrowLeft
        : verticalDistance > 0
          ? directions.ArrowDown
          : directions.ArrowUp

    setShowControlsHint(false)
    changeDirection(direction)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileMediaQuery)
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    mediaQuery.addEventListener('change', updateMobileState)
    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  useEffect(() => {
    if (isMobile || isSnakeVisible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        reopenSnake()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, isSnakeVisible])

  useEffect(() => {
    const socialTimer = window.setTimeout(() => setShowSocials(true), socialRevealAt)
    const snakeTimer = window.setTimeout(() => {
      setShowSnake(true)
      setIsSnakeEntering(true)
    }, snakeRevealAt)
    const snakeEntranceTimer = window.setTimeout(
      () => setIsSnakeEntering(false),
      snakeRevealAt + 500,
    )

    return () => {
      window.clearTimeout(socialTimer)
      window.clearTimeout(snakeTimer)
      window.clearTimeout(snakeEntranceTimer)
    }
  }, [])

  useEffect(() => {
    if (!isSnakeVisible || !showSnake || !boardRef.current) return

    const board = boardRef.current
    const updateBoardSize = () => {
      const { height, width } = board.getBoundingClientRect()
      if (!height || !width) return

      const targetCellSize = width >= 1_000 ? 34 : 28
      const nextBoardSize = {
        width: Math.max(10, Math.round(width / targetCellSize)),
        height: Math.max(12, Math.round(height / targetCellSize)),
      }

      setBoardSize((currentBoardSize) =>
        currentBoardSize.width === nextBoardSize.width &&
        currentBoardSize.height === nextBoardSize.height
          ? currentBoardSize
          : nextBoardSize,
      )
    }

    const observer = new ResizeObserver(updateBoardSize)
    observer.observe(board)
    updateBoardSize()

    return () => observer.disconnect()
  }, [isSnakeVisible, showSnake])

  useEffect(() => {
    gameRef.current = createGame(boardSize)
    setIsGameOver(false)
    drawGame(canvasRef.current, gameRef.current)
  }, [boardSize])

  useEffect(() => {
    if (!isSnakeVisible) return

    const renderGame = () => drawGame(canvasRef.current, gameRef.current)
    let animationFrame = 0

    const animateFood = (time: number) => {
      drawGame(canvasRef.current, gameRef.current, time)
      animationFrame = window.requestAnimationFrame(animateFood)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameRef.current.isOver) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault()
          setGameOverAction((action) => (action === 'restart' ? 'hide' : 'restart'))
          return
        }

        if (event.key === 'Enter') {
          event.preventDefault()
          if (gameOverAction === 'restart') {
            restartGame()
          } else {
            hideSnake()
          }
          return
        }
      }

      if (event.key in directions) {
        event.preventDefault()
        setShowControlsHint(false)
        const nextDirection = directions[event.key]
        const currentDirection = gameRef.current.direction

        if (
          nextDirection.x !== -currentDirection.x ||
          nextDirection.y !== -currentDirection.y
        ) {
          gameRef.current.direction = nextDirection
        }
      }

      if (gameRef.current.isOver && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        restartGame()
      }
    }

    const tick = () => {
      const game = gameRef.current
      if (game.isOver) return

      const head = game.snake[0]
      const nextHead = {
        x: head.x + game.direction.x,
        y: head.y + game.direction.y,
      }
      const eatsFood = positionsMatch(nextHead, game.food)
      const collisionTargets = eatsFood ? game.snake : game.snake.slice(0, -1)
      const hitWall =
        nextHead.x < 0 ||
        nextHead.x >= game.boardSize.width ||
        nextHead.y < 0 ||
        nextHead.y >= game.boardSize.height
      const hitSnake = collisionTargets.some((segment) => positionsMatch(segment, nextHead))

      if (hitWall || hitSnake) {
        game.isOver = true
        setIsGameOver(true)
        setGameOverAction('restart')
        renderGame()
        return
      }

      game.snake.unshift(nextHead)
      if (eatsFood) {
        game.score += 1
        setHighScore((currentHighScore) => Math.max(currentHighScore, game.score))
        game.food = createFood(game.snake, game.boardSize)
      } else {
        game.snake.pop()
      }
      renderGame()
    }

    renderGame()
    animationFrame = window.requestAnimationFrame(animateFood)
    window.addEventListener('keydown', handleKeyDown)
    let gameLoop: number | undefined
    const gameStartDelay = Math.max(0, gameStartAtRef.current - performance.now())
    const gameStartTimer = window.setTimeout(() => {
      gameLoop = window.setInterval(tick, 110)
    }, gameStartDelay)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(gameStartTimer)
      if (gameLoop) window.clearInterval(gameLoop)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [isSnakeVisible, gameOverAction, boardSize])

  return (
    <main className="ambient-background flex min-h-svh flex-col items-center justify-start gap-8 px-8 pt-[25svh] pb-8">
      {isSnakeVisible && showSnake && (
        <div className="snake-stage absolute inset-5 z-0 md:inset-8">
        <div
          ref={boardRef}
          className={`snake-board absolute inset-0 touch-none overflow-hidden rounded-2xl select-none ${isSnakeEntering ? 'snake-enter' : ''} ${isGameOver ? 'snake-game-over' : ''}`}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <canvas
            ref={canvasRef}
            width={boardSize.width}
            height={boardSize.height}
            className="size-full"
            aria-label="Snake game. Use the arrow keys to control the snake."
          />
          <div className="absolute top-5 left-5 z-10 font-['Press_Start_2P',monospace] text-[0.55rem] leading-relaxed text-neutral-400 drop-shadow-md">
            <span className="block">High Score</span>
            <span className="text-[0.9rem] text-neutral-200">{highScore}</span>
          </div>
          {showControlsHint && (
            isMobile ? (
              <span className="absolute top-5 right-5 z-10 font-['Press_Start_2P',monospace] text-[0.7rem] leading-relaxed text-neutral-200 drop-shadow-md">
                Swipe to move
              </span>
            ) : (
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
              <span className="font-['Press_Start_2P',monospace] text-[0.8rem] leading-relaxed">
                Use arrow keys
              </span>
            </div>
            )
          )}
        </div>
        </div>
      )}
      {!isSnakeVisible && (
        <button
          type="button"
          onClick={reopenSnake}
          aria-label="Show Snake"
          className="absolute top-6 right-6 z-10 grid size-9 place-items-center rounded-full border border-[#74c900] bg-[#07090d]/70 text-[#d9ff7a] transition-colors hover:bg-[#74c900] hover:text-[#07090d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path
              d="M4 7h8a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h2M18 17l2-2m-2 2 2 2"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </button>
      )}
      <h1
        className="relative z-10 m-0 text-center font-[Anta,sans-serif] text-[clamp(2rem,7vw,5rem)] font-normal leading-[1.1] tracking-[-0.04em] text-neutral-100"
        aria-label={greeting}
      >
        <span className="block">
          {salutation.split('').map((character, index) => (
            <span
              key={`${character}-${index}`}
              aria-hidden="true"
              className="title-reveal-character"
              style={{ animationDelay: `${index * 21}ms` }}
            >
              {character === ' ' ? '\u00A0' : character}
            </span>
          ))}
        </span>
        <span className="block">
          {introduction.split(' ').map((word, wordIndex, words) => {
            const characterOffset = words
              .slice(0, wordIndex)
              .reduce((length, previousWord) => length + previousWord.length + 1, 0)

            return (
              <span key={word}>
                <span className="inline-block whitespace-nowrap">
                  {word.split('').map((character, characterIndex) => (
                    <span
                      key={`${character}-${characterIndex}`}
                      aria-hidden="true"
                      className="title-reveal-character"
                      style={{ animationDelay: `${722 + (characterOffset + characterIndex) * 21}ms` }}
                    >
                      {character}
                    </span>
                  ))}
                </span>
                {wordIndex < words.length - 1 && ' '}
              </span>
            )
          })}
        </span>
      </h1>
      {showSocials && (
      <nav className="relative z-10 flex items-center gap-4" aria-label="Social links">
        <a
          href="https://www.linkedin.com/in/josephwangemann/"
          aria-label="LinkedIn"
          target="_blank"
          rel="noreferrer"
            className="social-entrance social-icon social-icon--bloom grid size-10 place-items-center rounded-full border border-[#70b7f5] text-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5.37 3.5a1.87 1.87 0 1 1 0 3.74 1.87 1.87 0 0 1 0-3.74ZM3.75 8.75H7v11.5H3.75V8.75ZM9 8.75h3.11v1.57h.04c.43-.82 1.49-1.69 3.07-1.69 3.29 0 3.9 2.17 3.9 4.99v6.63h-3.24v-5.88c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v5.98H8.43V8.75H9Z"
            />
          </svg>
        </a>
        <a
          href="https://github.com/josephwangemann"
          aria-label="GitHub"
          target="_blank"
          rel="noreferrer"
            className="social-entrance social-entrance--delayed social-icon social-icon--bloom size-10 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100"
        >
          <img
            src={sunriseAvatar}
            alt=""
            className="size-full object-cover object-center"
          />
        </a>
      </nav>
      )}
      {isSnakeVisible && showSnake && isGameOver && (
        <div className="relative z-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={restartGame}
            className={`rounded-full border px-5 py-3 font-['Press_Start_2P',monospace] text-[0.65rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100 ${
              gameOverAction === 'restart'
                ? 'border-[#70b7f5] bg-[#70b7f5] text-[#07090d]'
                : 'border-white/25 bg-[#07090d]/90 text-neutral-300 hover:border-[#70b7f5] hover:text-neutral-100'
            }`}
          >
            Restart
          </button>
          <button
            type="button"
            onClick={hideSnake}
            className={`rounded-full border px-5 py-3 font-['Press_Start_2P',monospace] text-[0.65rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100 ${
              gameOverAction === 'hide'
                ? 'border-[#70b7f5] bg-[#70b7f5] text-[#07090d]'
                : 'border-white/25 bg-[#07090d]/90 text-neutral-300 hover:border-[#70b7f5] hover:text-neutral-100'
            }`}
          >
            Hide Snake
          </button>
        </div>
      )}
    </main>
  )
}

export default App
