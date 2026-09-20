import { useEffect, type RefObject } from 'react'
import { titleRevealDuration } from '../constants/animation'

export function useTitlePhysics(titleRef: RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const title = titleRef.current
    if (!title) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const readyAt = performance.now() + titleRevealDuration
    const letters = Array.from(title.querySelectorAll<HTMLElement>('.title-reveal-character'), (element) => ({
      element, x: 0, y: 0, vx: 0, vy: 0, waveAt: 0,
    }))
    let pointer: { x: number; y: number } | null = null
    let tap: { x: number; y: number; at: number; id: number } | null = null
    let frame = 0
    let previousTime = 0

    const animate = (now: number) => {
      frame = 0
      const elapsed = Math.min((now - previousTime) / 1000, 1 / 30)
      previousTime = now
      // Measure the resting positions, independent of each letter's displacement.
      const centers = letters.map(({ element, x, y }) => {
        const bounds = element.getBoundingClientRect()
        return { x: bounds.left + bounds.width / 2 - x, y: bounds.top + bounds.height / 2 - y }
      })
      let moving = false

      letters.forEach((letter, index) => {
        let targetX = 0
        let targetY = 0
        if (pointer) {
          const dx = centers[index].x - pointer.x
          const dy = centers[index].y - pointer.y
          const distance = Math.hypot(dx, dy)
          const force = 5 * Math.max(0, 1 - distance / 110) ** 2
          targetX = distance > 0 ? dx / distance * force : 0
          targetY = distance > 0 ? dy / distance * force : -force
        }
        if (letter.waveAt) {
          const age = now - letter.waveAt
          if (age >= 180) letter.waveAt = 0
          else {
            moving = true
            if (age >= 0) targetY -= 5 * Math.sin(age / 180 * Math.PI)
          }
        }

        // Small integration steps keep the spring consistent across refresh rates.
        const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
        const dt = elapsed / steps
        for (let step = 0; step < steps; step += 1) {
          letter.vx += ((targetX - letter.x) * 200 - letter.vx * 18) * dt
          letter.vy += ((targetY - letter.y) * 200 - letter.vy * 18) * dt
          letter.x = Math.max(-7, Math.min(7, letter.x + letter.vx * dt))
          letter.y = Math.max(-7, Math.min(7, letter.y + letter.vy * dt))
        }
        if (Math.abs(targetX - letter.x) + Math.abs(targetY - letter.y) + Math.abs(letter.vx) + Math.abs(letter.vy) > 0.03) {
          moving = true
        } else {
          letter.x = targetX
          letter.y = targetY
          letter.vx = 0
          letter.vy = 0
        }
        // Individual translate composes with the entrance animation's transform.
        letter.element.style.translate = `${letter.x}px ${letter.y}px`
      })
      if (moving) frame = window.requestAnimationFrame(animate)
    }

    const wake = () => {
      if (frame || reducedMotion.matches || performance.now() < readyAt) return
      previousTime = performance.now()
      frame = window.requestAnimationFrame(animate)
    }
    const movePointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches) return
      pointer = { x: event.clientX, y: event.clientY }
      wake()
    }
    const releasePointer = () => {
      pointer = null
      tap = null
      wake()
    }
    const leaveWindow = (event: PointerEvent) => {
      if (!event.relatedTarget) releasePointer()
    }
    const startTap = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return
      tap = { x: event.clientX, y: event.clientY, at: performance.now(), id: event.pointerId }
    }
    const endTap = (event: PointerEvent) => {
      const start = tap
      tap = null
      const now = performance.now()
      if (!start || start.id !== event.pointerId || reducedMotion.matches || now < readyAt) return
      if (now - start.at > 500 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return
      for (const letter of letters) {
        const bounds = letter.element.getBoundingClientRect()
        const distance = Math.hypot(bounds.left + bounds.width / 2 - letter.x - start.x, bounds.top + bounds.height / 2 - letter.y - start.y)
        letter.waveAt = now + distance / 1.2
      }
      wake()
    }
    const reset = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      pointer = null
      tap = null
      for (const letter of letters) {
        letter.x = letter.y = letter.vx = letter.vy = letter.waveAt = 0
        letter.element.style.removeProperty('translate')
      }
    }

    window.addEventListener('pointermove', movePointer, { passive: true })
    window.addEventListener('pointerout', leaveWindow)
    window.addEventListener('blur', releasePointer)
    window.addEventListener('pointerup', endTap)
    window.addEventListener('pointercancel', releasePointer)
    title.addEventListener('pointerdown', startTap, { passive: true })
    reducedMotion.addEventListener('change', reset)
    finePointer.addEventListener('change', reset)
    return () => {
      reset()
      window.removeEventListener('pointermove', movePointer)
      window.removeEventListener('pointerout', leaveWindow)
      window.removeEventListener('blur', releasePointer)
      window.removeEventListener('pointerup', endTap)
      window.removeEventListener('pointercancel', releasePointer)
      title.removeEventListener('pointerdown', startTap)
      reducedMotion.removeEventListener('change', reset)
      finePointer.removeEventListener('change', reset)
    }
  }, [titleRef])
}
