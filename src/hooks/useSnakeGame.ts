import { useEffect, useRef, useState, type TouchEvent } from 'react'

const initialBoardSize = { height: 18, width: 28 }
const mobileMediaQuery = '(max-width: 767px)'

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
type Game = {
  boardSize: BoardSize
  direction: Direction
  food: Position
  isOver: boolean
  score: number
  snake: Position[]
  particles: Particle[]
  trail: TrailSegment[]
}

const particleDuration = 480
const trailDuration = 340

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
    trail: [],
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
    const opacity = Math.max(0, 1 - (time - segment.createdAt) / trailDuration)
    context.fillStyle = `rgba(116, 201, 0, ${opacity * 0.22})`
    context.fillRect(segment.x + 0.2, segment.y + 0.2, 0.6, 0.6)
  })

  game.particles.forEach((particle) => {
    const age = time - particle.createdAt
    const opacity = Math.max(0, 1 - age / particleDuration)
    const size = 0.08 + opacity * 0.08
    context.fillStyle = `rgba(255, 112, 145, ${opacity})`
    context.fillRect(
      particle.x + particle.velocityX * age - size / 2,
      particle.y + particle.velocityY * age - size / 2,
      size,
      size,
    )
  })

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

export function useSnakeGame(isReady: boolean, gameStartDelay: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game>(createGame(initialBoardSize))
  const gameStartAtRef = useRef(performance.now() + gameStartDelay)
  const touchStartRef = useRef<Position | null>(null)
  const [boardSize, setBoardSize] = useState<BoardSize>(initialBoardSize)
  const [gameOverAction, setGameOverAction] = useState<'restart' | 'hide'>('restart')
  const [highScore, setHighScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mobileMediaQuery).matches)
  const [isSnakeVisible, setIsSnakeVisible] = useState(true)
  const [showControlsHint, setShowControlsHint] = useState(true)

  const restartGame = () => {
    gameRef.current = createGame(boardSize)
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
    setIsGameOver(false)
    drawGame(canvasRef.current, gameRef.current)
  }, [boardSize])

  useEffect(() => {
    if (!isReady || !isSnakeVisible) return

    const renderGame = () => drawGame(canvasRef.current, gameRef.current)
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
      game.particles = game.particles.filter((particle) => now - particle.createdAt < particleDuration)
      game.trail = game.trail.filter((segment) => now - segment.createdAt < trailDuration)

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
        setIsGameOver(true)
        setGameOverAction('restart')
        renderGame()
        return
      }

      game.snake.unshift(nextHead)
      if (eatsFood) {
        game.score += 1
        setHighScore((currentHighScore) => Math.max(currentHighScore, game.score))
        game.particles.push(...createFoodParticles(game.food, now))
        game.food = createFood(game.snake, game.boardSize)
      } else {
        const tail = game.snake.pop()
        if (tail) game.trail.push({ ...tail, createdAt: now })
      }
      renderGame()
    }

    const animateFood = (time: number) => {
      drawGame(canvasRef.current, gameRef.current, time)
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
  }, [boardSize, gameOverAction, isReady, isSnakeVisible])

  return {
    boardRef,
    boardSize,
    canvasRef,
    gameOverAction,
    handleTouchEnd,
    handleTouchStart,
    hideSnake,
    highScore,
    isGameOver,
    isMobile,
    isSnakeVisible,
    reopenSnake,
    restartGame,
    showControlsHint,
  }
}
