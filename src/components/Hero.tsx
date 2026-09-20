import { useEffect, useState } from 'react'
import { titleRevealDuration } from '../constants/animation'

const salutation = 'Hi!'
const introduction = 'Joseph Wangemann here.'
const greeting = `${salutation} ${introduction}`
const signalCandidates = [
  ...salutation.split('').map((character, index) => `salutation-${index}`),
  ...introduction
    .split('')
    .flatMap((character, index) => (character === ' ' ? [] : [`introduction-${index}`])),
]

export function Hero() {
  const [signalCharacter, setSignalCharacter] = useState<string | null>(null)

  useEffect(() => {
    let nextSignalTimer: number
    let clearSignalTimer: number | undefined

    const scheduleSignal = () => {
      nextSignalTimer = window.setTimeout(() => {
        const nextCharacter = signalCandidates[Math.floor(Math.random() * signalCandidates.length)] ?? null
        setSignalCharacter(nextCharacter)
        clearSignalTimer = window.setTimeout(() => {
          setSignalCharacter(null)
          scheduleSignal()
        }, 850)
      }, 20_000 + Math.random() * 10_000)
    }

    nextSignalTimer = window.setTimeout(scheduleSignal, titleRevealDuration)

    return () => {
      window.clearTimeout(nextSignalTimer)
      if (clearSignalTimer) window.clearTimeout(clearSignalTimer)
    }
  }, [])

  return (
    <h1
      className="relative z-10 m-0 text-center font-[Anta,sans-serif] text-[clamp(2rem,7vw,5rem)] font-normal leading-[1.1] tracking-[-0.04em] text-neutral-100"
      aria-label={greeting}
    >
      <span className="block">
        {salutation.split('').map((character, index) => (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            className={`title-reveal-character ${signalCharacter === `salutation-${index}` ? 'title-idle-signal' : ''}`}
            style={{ animationDelay: `${index * 21}ms` }}
          >
            {character}
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
                    className={`title-reveal-character ${signalCharacter === `introduction-${characterOffset + characterIndex}` ? 'title-idle-signal' : ''}`}
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
  )
}
