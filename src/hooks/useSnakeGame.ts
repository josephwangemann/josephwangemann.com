import { useEffect, useRef, useState, type TouchEvent } from 'react'

const initialBoardSize = { height: 18, width: 28 }
const mobileMediaQuery = '(max-width: 767px)'
const midnightScore = 5

type Position = { x: number; y: number }
type Direction = { x: number; y: number }
type BoardSize = { height: number; width: number }
type Particle = {
  createdAt: number
  velocityX: number
  velocityY: number
  x: number
  y: number
}
type TrailSegment = Position & { createdAt: number }
type SnakePiece = { from: Position; to: Position; color: string; fromSize: number; toSize: number }
type SnakeTransition = { kind: 'death' | 'restart'; startedAt: number; pieces: SnakePiece[] }
export type FoodPulse = { x: number; y: number; reach: number; createdAt: number; isMidnight: boolean }
type Game = {
  boardSize: BoardSize
  direction: Direction
  food: Position
  isOver: boolean
  score: number
  snake: Position[]
  stoppedAt: number | null
  particles: Particle[]
  trail: TrailSegment[]
  foodPulses: (Position & { createdAt: number })[]
  recordAt: number | null
  transition: SnakeTransition | null
}

const particleDuration = 480
const trailDuration = 340
const recordDuration = 1400
const impactPause = 80
const breakupDuration = 300
const restartDuration = 280

function snakeColor(isMidnight: boolean, isHead: boolean) {
  return isMidnight ? (isHead ? '#d9fbff' : '#69e1f2') : (isHead ? '#d9ff7a' : '#74c900')
}

function samplePiece(piece: SnakePiece, transition: SnakeTransition, time: number) {
  const delay = transition.kind === 'death' ? impactPause : 0
  const duration = transition.kind === 'death' ? breakupDuration : restartDuration
  const progress = Math.max(0, Math.min(1, (time - transition.startedAt - delay) / duration))
  const eased = transition.kind === 'death' ? 1 - (1 - progress) ** 3 : progress * progress * (3 - 2 * progress)
  return {
    x: piece.from.x + (piece.to.x - piece.from.x) * eased,
    y: piece.from.y + (piece.to.y - piece.from.y) * eased,
    size: piece.fromSize + (piece.toSize - piece.fromSize) * eased,
  }
}

function breakSnake(game: Game, now: number): SnakeTransition {
  return {
    kind: 'death',
    startedAt: now,
    pieces: game.snake.flatMap((segment, index) => Array.from({ length: 4 }, (_, corner) => {
      const from = { x: segment.x + 0.31 + (corner % 2) * 0.38, y: segment.y + 0.31 + Math.floor(corner / 2) * 0.38 }
      return {
        from,
        to: {
          x: Math.max(0.2, Math.min(game.boardSize.width - 0.2, from.x + ((corner % 2) * 2 - 1) * (0.2 + Math.random() * 0.45))),
          y: Math.max(0.2, Math.min(game.boardSize.height - 0.2, from.y + 0.25 + Math.random() * 0.65)),
        },
        color: snakeColor(game.score >= midnightScore, index === 0),
        fromSize: 0.38,
        toSize: 0.22,
      }
    })),
  }
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
    boardSize,
    direction: directions.ArrowRight,
    food: createFood(snake, boardSize),
    isOver: false,
    particles: [],
    score: 0,
    snake,
    stoppedAt: null,
    trail: [],
    foodPulses: [],
    recordAt: null,
    transition: null,
  }
}

function createFoodParticles(food: Position, createdAt: number): Particle[] {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2 + Math.random() * 0.35
    const speed = 0.0012 + Math.random() * 0.0014

    return {
      x: food.x + 0.5,
      y: food.y + 0.5,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      createdAt,
    }
  })
}

function drawGame(canvas: HTMLCanvasElement | null, game: Game, time = performance.now()) {
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  const animationTime = game.stoppedAt ?? time
  const isMidnight = game.score >= midnightScore

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

  game.trail.forEach((segment) => {
    const opacity = Math.max(0, 1 - (animationTime - segment.createdAt) / trailDuration)
    context.fillStyle = `rgba(${isMidnight ? '105, 225, 242' : '116, 201, 0'}, ${opacity * 0.22})`
    context.fillRect(segment.x + 0.2, segment.y + 0.2, 0.6, 0.6)
  })

  game.particles.forEach((particle) => {
    const age = animationTime - particle.createdAt
    const opacity = Math.max(0, 1 - age / particleDuration)
    const size = 0.08 + opacity * 0.08
    context.fillStyle = `rgba(${isMidnight ? '255, 205, 112' : '255, 112, 145'}, ${opacity})`
    context.fillRect(
      particle.x + particle.velocityX * age - size / 2,
      particle.y + particle.velocityY * age - size / 2,
      size,
      size,
    )
  })

  context.fillStyle = isMidnight ? '#ffcd70' : '#ff4f7b'
  const foodSize = 0.58 + Math.sin(animationTime / 150) * 0.22
  context.fillRect(
    game.food.x + (1 - foodSize) / 2,
    game.food.y + (1 - foodSize) / 2,
    foodSize,
    foodSize,
  )

  const transition = game.transition
  const showPieces = transition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
    transition.kind === 'death'
      ? time >= transition.startedAt + impactPause
      : time < transition.startedAt + restartDuration
  )
  if (showPieces) return
  game.snake.forEach((segment, index) => {
    context.fillStyle = snakeColor(isMidnight, index === 0)
    context.fillRect(segment.x + 0.12, segment.y + 0.12, 0.76, 0.76)
  })
}

function drawReactions(canvas: HTMLCanvasElement | null, game: Game, time: number) {
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const ratio = window.devicePixelRatio || 1
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const transition = game.transition
  if (transition && (transition.kind === 'death'
    ? time >= transition.startedAt + impactPause
    : time < transition.startedAt + restartDuration)) {
    const cellWidth = width / game.boardSize.width
    const cellHeight = height / game.boardSize.height
    for (const piece of transition.pieces) {
      const position = samplePiece(piece, transition, time)
      context.fillStyle = piece.color
      context.fillRect((position.x - position.size / 2) * cellWidth, (position.y - position.size / 2) * cellHeight, position.size * cellWidth, position.size * cellHeight)
    }
  }
  const now = game.stoppedAt ?? time
  const reach = Math.hypot(width, height)
  const foodColor = game.score >= midnightScore ? '255, 205, 112' : '255, 79, 123'

  for (const pulse of game.foodPulses) {
    const progress = (now - pulse.createdAt) / 1100
    if (progress < 0 || progress >= 1) continue
    const x = ((pulse.x + 0.5) / game.boardSize.width) * width
    const y = ((pulse.y + 0.5) / game.boardSize.height) * height
    const radius = Math.max(1, reach * progress)
    const glow = context.createRadialGradient(x, y, Math.max(0, radius - 70), x, y, radius)
    glow.addColorStop(0, `rgba(${foodColor}, 0)`)
    glow.addColorStop(0.65, `rgba(${foodColor}, ${0.13 * (1 - progress)})`)
    glow.addColorStop(1, `rgba(${foodColor}, 0)`)
    context.fillStyle = glow
    context.fillRect(0, 0, width, height)
  }

  if (game.recordAt === null) return
  const progress = (now - game.recordAt) / recordDuration
  if (progress < 0 || progress >= 1) return
  const inset = 2
  const radius = 14
  const perimeter = 2 * (width + height - 4 * inset) - 8 * radius + 2 * Math.PI * radius
  context.save()
  context.beginPath()
  context.roundRect(inset, inset, width - 2 * inset, height - 2 * inset, radius)
  context.strokeStyle = `rgba(217, 255, 122, ${Math.sin(Math.PI * progress) * 0.85})`
  context.lineWidth = 2
  context.shadowColor = '#d9ff7a'
  context.shadowBlur = 10
  context.setLineDash([perimeter * 0.12, perimeter * 0.88])
  context.lineDashOffset = -perimeter * progress
  context.stroke()
  context.restore()
}

export function useSnakeGame(isReady: boolean, gameStartDelay: number, onFoodEaten: (pulse: FoodPulse) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reactionsRef = useRef<HTMLCanvasElement>(null)
  const highScoreRef = useRef(0)
  const highScoreLabelRef = useRef<HTMLSpanElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game>(createGame(initialBoardSize))
  const gameStartAtRef = useRef(performance.now() + gameStartDelay)
  const touchStartRef = useRef<Position | null>(null)
  const [boardSize, setBoardSize] = useState<BoardSize>(initialBoardSize)
  const [gameOverAction, setGameOverAction] = useState<'restart' | 'hide'>('restart')
  const [highScore, setHighScore] = useState(0)
  const [score, setScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mobileMediaQuery).matches)
  const [isSnakeVisible, setIsSnakeVisible] = useState(true)
  const [showControlsHint, setShowControlsHint] = useState(true)

  const restartGame = () => {
    const previous = gameRef.current.transition
    const next = createGame(boardSize)
    const now = performance.now()
    if (previous?.kind === 'death' && isSnakeVisible && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      next.transition = {
        kind: 'restart',
        startedAt: now,
        pieces: previous.pieces.map((piece, index) => {
          const position = samplePiece(piece, previous, now)
          const segmentIndex = Math.floor(index / 4) % next.snake.length
          const segment = next.snake[segmentIndex]
          return {
            from: { x: position.x, y: position.y },
            to: { x: segment.x + 0.31 + (index % 2) * 0.38, y: segment.y + 0.31 + Math.floor(index % 4 / 2) * 0.38 },
            color: snakeColor(false, segmentIndex === 0),
            fromSize: position.size,
            toSize: 0.38,
          }
        }),
      }
    }
    gameRef.current = next
    setScore(0)
    setIsGameOver(false)
    setGameOverAction('restart')
    drawGame(canvasRef.current, gameRef.current)
  }

  const hideSnake = () => setIsSnakeVisible(false)

  const reopenSnake = () => {
    restartGame()
    setIsSnakeVisible(true)
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

    changeDirection(
      Math.abs(horizontalDistance) > Math.abs(verticalDistance)
        ? horizontalDistance > 0
          ? directions.ArrowRight
          : directions.ArrowLeft
        : verticalDistance > 0
          ? directions.ArrowDown
          : directions.ArrowUp,
    )
    setShowControlsHint(false)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileMediaQuery)
    const updateMobileState = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', updateMobileState)
    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  useEffect(() => {
    if (!isReady || isSnakeVisible || isMobile) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        reopenSnake()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, isReady, isSnakeVisible])

  useEffect(() => {
    if (!isReady || !isSnakeVisible || !boardRef.current) return

    const board = boardRef.current
    const updateBoardSize = () => {
      const { height, width } = board.getBoundingClientRect()
      if (!height || !width) return

      const screenScale = Math.min(width / 1_360, height / 800)
      const targetCellSize = Math.max(28, Math.min(72, 36 * screenScale))
      const nextBoardSize = {
        width: Math.max(10, Math.round(width / targetCellSize)),
        height: Math.max(12, Math.round(height / targetCellSize)),
      }

      setBoardSize((currentBoardSize) =>
        currentBoardSize.width === nextBoardSize.width && currentBoardSize.height === nextBoardSize.height
          ? currentBoardSize
          : nextBoardSize,
      )
    }

    const observer = new ResizeObserver(updateBoardSize)
    observer.observe(board)
    updateBoardSize()
    return () => observer.disconnect()
  }, [isReady, isSnakeVisible])

  useEffect(() => {
    gameRef.current = createGame(boardSize)
    setScore(0)
    setIsGameOver(false)
    drawGame(canvasRef.current, gameRef.current)
  }, [boardSize])

  useEffect(() => {
    if (!isReady || !isSnakeVisible) return

    const renderGame = (time = performance.now()) => {
      const game = gameRef.current
      drawGame(canvasRef.current, game, time)
      drawReactions(reactionsRef.current, game, time)
      const label = highScoreLabelRef.current
      if (label) {
        const progress = game.recordAt === null ? 1 : ((game.stoppedAt ?? time) - game.recordAt) / recordDuration
        const glow = progress >= 0 && progress < 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? Math.sin(Math.PI * progress)
          : 0
        label.style.color = glow ? `rgb(${163 + 54 * glow}, ${163 + 92 * glow}, ${163 - 41 * glow})` : ''
        label.style.textShadow = glow ? `0 0 0.8em rgba(217, 255, 122, ${glow * 0.7})` : ''
      }
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
          if (gameOverAction === 'restart') restartGame()
          else hideSnake()
          return
        }
      }

      if (event.key in directions) {
        event.preventDefault()
        setShowControlsHint(false)
        changeDirection(directions[event.key])
      }
    }

    const tick = () => {
      const game = gameRef.current
      if (game.isOver) return

      const now = performance.now()
      if (game.transition?.kind === 'restart') {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && now < game.transition.startedAt + restartDuration + 80) return
        game.transition = null
      }
      game.particles = game.particles.filter((particle) => now - particle.createdAt < particleDuration)
      game.trail = game.trail.filter((segment) => now - segment.createdAt < trailDuration)
      game.foodPulses = game.foodPulses.filter((pulse) => now - pulse.createdAt < 1100)

      const head = game.snake[0]
      const nextHead = { x: head.x + game.direction.x, y: head.y + game.direction.y }
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
        game.stoppedAt = now
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) game.transition = breakSnake(game, now)
        setIsGameOver(true)
        setGameOverAction('restart')
        renderGame()
        return
      }

      game.snake.unshift(nextHead)
      if (eatsFood) {
        game.score += 1
        setScore(game.score)
        if (game.score > highScoreRef.current) {
          if (game.recordAt === null) game.recordAt = now
          highScoreRef.current = game.score
          setHighScore(game.score)
        }
        game.foodPulses.push({ ...game.food, createdAt: now })
        const bounds = canvasRef.current?.getBoundingClientRect()
        if (bounds) {
          onFoodEaten({
            x: bounds.left + ((game.food.x + 0.5) / game.boardSize.width) * bounds.width,
            y: bounds.top + ((game.food.y + 0.5) / game.boardSize.height) * bounds.height,
            reach: Math.hypot(bounds.width, bounds.height),
            createdAt: now,
            isMidnight: game.score >= midnightScore,
          })
        }
        game.particles.push(...createFoodParticles(game.food, now))
        game.food = createFood(game.snake, game.boardSize)
      } else {
        const tail = game.snake.pop()
        if (tail) game.trail.push({ ...tail, createdAt: now })
      }
      renderGame()
    }

    const animateFood = (time: number) => {
      renderGame(time)
      animationFrame = window.requestAnimationFrame(animateFood)
    }

    renderGame()
    let animationFrame = window.requestAnimationFrame(animateFood)
    window.addEventListener('keydown', handleKeyDown)
    let gameLoop: number | undefined
    const delay = Math.max(0, gameStartAtRef.current - performance.now())
    const gameStartTimer = window.setTimeout(() => {
      gameLoop = window.setInterval(tick, 110)
    }, delay)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(gameStartTimer)
      if (gameLoop) window.clearInterval(gameLoop)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [boardSize, gameOverAction, isReady, isSnakeVisible, onFoodEaten])

  return {
    boardRef,
    boardSize,
    canvasRef,
    reactionsRef,
    gameOverAction,
    handleTouchEnd,
    handleTouchStart,
    hideSnake,
    highScore,
    highScoreLabelRef,
    isGameOver,
    isMobile,
    isMidnight: score >= midnightScore && isSnakeVisible,
    isSnakeVisible,
    reopenSnake,
    restartGame,
    score,
    showControlsHint,
  }
}
