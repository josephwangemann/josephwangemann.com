import { useEffect, useState } from 'react'
import { Hero } from './components/Hero'
import { CustomCursor } from './components/CustomCursor'
import { SnakeGame } from './components/SnakeGame'
import { SocialLinks } from './components/SocialLinks'
import { gameStartDelay, socialRevealAt, snakeRevealAt } from './constants/animation'
import type { ColorMode, FoodPulse } from './hooks/useSnakeGame'

function App() {
  const [showSocials, setShowSocials] = useState(false)
  const [showSnake, setShowSnake] = useState(false)
  const [foodPulse, setFoodPulse] = useState<FoodPulse | null>(null)
  const [colorMode, setColorMode] = useState<ColorMode>('dusk')

  useEffect(() => {
    const socialTimer = window.setTimeout(() => setShowSocials(true), socialRevealAt)
    const snakeTimer = window.setTimeout(() => setShowSnake(true), snakeRevealAt)

    return () => {
      window.clearTimeout(socialTimer)
      window.clearTimeout(snakeTimer)
    }
  }, [])

  return (
    <main className={`ambient-background ${colorMode !== 'dusk' ? 'ambient-background--midnight' : ''} ${colorMode === 'aurora' || colorMode === 'dawn' ? 'ambient-background--aurora' : ''} ${colorMode === 'dawn' ? 'ambient-background--dawn' : ''} flex min-h-svh flex-col items-center justify-start gap-8 px-8 pt-[25svh] pb-8`}>
      <div className="dawn-background" aria-hidden="true" />
      {colorMode === 'dawn' && <div className="dawn-burst" aria-hidden="true" />}
      <CustomCursor />
      <Hero foodPulse={foodPulse} />
      {showSocials && <SocialLinks />}
      <SnakeGame isReady={showSnake} gameStartDelay={gameStartDelay} onFoodEaten={setFoodPulse} onColorModeChange={setColorMode} />
    </main>
  )
}

export default App
