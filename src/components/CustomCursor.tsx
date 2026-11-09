import { useEffect, useState } from 'react'

type CursorPosition = { x: number; y: number; isInteractive: boolean }

export function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition | null>(null)

  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest('a[href], button, [role="button"]')
        : null
      setPosition({
        x: event.clientX,
        y: event.clientY,
        isInteractive: target !== null && !target.matches(':disabled, [aria-disabled="true"]'),
      })
    }

    const hideCursor = (event: MouseEvent) => {
      if (!event.relatedTarget) setPosition(null)
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', moveCursor)
    window.addEventListener('mouseout', hideCursor)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', moveCursor)
      window.removeEventListener('mouseout', hideCursor)
    }
  }, [])

  if (!position) return null

  return (
    <div
      aria-hidden="true"
      className={`custom-cursor ${position.isInteractive ? 'custom-cursor--interactive' : ''}`}
      style={{ transform: `translate3d(${position.x - 5}px, ${position.y - 2}px, 0)` }}
    >
      <img src="/cursor-arrow.svg" alt="" />
    </div>
  )
}
