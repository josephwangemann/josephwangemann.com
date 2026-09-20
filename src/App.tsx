import { useEffect, useState } from 'react'
import { Hero } from './components/Hero'
import { CustomCursor } from './components/CustomCursor'
import { SnakeGame } from './components/SnakeGame'
import { SocialLinks } from './components/SocialLinks'
import { gameStartDelay, socialRevealAt, snakeRevealAt } from './constants/animation'
import type { FoodPulse } from './hooks/useSnakeGame'

function App() {
  const [showSocials, setShowSocials] = useState(false)
  const [showSnake, setShowSnake] = useState(false)
  const [foodPulse, setFoodPulse] = useState<FoodPulse | null>(null)

  useEffect(() => {
    const socialTimer = window.setTimeout(() => setShowSocials(true), socialRevealAt)
    const snakeTimer = window.setTimeout(() => setShowSnake(true), snakeRevealAt)

    return () => {
      window.clearTimeout(socialTimer)
      window.clearTimeout(snakeTimer)
    }
  }, [])

  return (
    <main className="ambient-background flex min-h-svh flex-col items-center justify-start gap-8 px-8 pt-[25svh] pb-8">
      <CustomCursor />
      <Hero foodPulse={foodPulse} />
      {showSocials && <SocialLinks />}
      <SnakeGame isReady={showSnake} gameStartDelay={gameStartDelay} onFoodEaten={setFoodPulse} />
    </main>
  )
}

export default App
