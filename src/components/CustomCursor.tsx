import { useEffect, useState } from 'react'

type CursorPosition = { x: number; y: number }

export function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition | null>(null)

  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    const hideCursor = (event: MouseEvent) => {
      if (!event.relatedTarget) setPosition(null)
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseout', hideCursor)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseout', hideCursor)
    }
  }, [])

  if (!position) return null

  return (
    <img
      src="/cursor-arrow.svg"
      alt=""
      aria-hidden="true"
      className="custom-cursor"
      style={{ transform: `translate3d(${position.x - 5}px, ${position.y - 2}px, 0)` }}
    />
  )
}
