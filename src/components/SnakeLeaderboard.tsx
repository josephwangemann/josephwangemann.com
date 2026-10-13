import { useEffect, useState } from 'react'
import type { LeaderboardEntry } from '../lib/leaderboard'

export function SnakeLeaderboard({ score }: { score: number }) {
  const [runId] = useState(() => crypto.randomUUID())
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [initials, setInitials] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let active = true
    setMessage('')
    import('../lib/leaderboard').then((service) => service.loadLeaderboard()).then((result) => {
      if (active) setEntries(result)
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  const isPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has('color-preview')
  const qualifies = !isPreview && entries !== null && score > 0 && (entries.length < 5 || score > entries[4].score)
  const buttonClass = 'rounded-full border border-white/25 px-3 py-2 text-neutral-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:opacity-50'

  if (entries === null || (entries.length === 0 && (!qualifies || isDone))) return null

  return (
    <section aria-label="Snake leaderboard" className="relative z-10 w-64 max-w-full rounded-xl border border-white/25 bg-[#07090d]/90 p-4 font-['Press_Start_2P',monospace] text-[0.55rem] leading-relaxed text-neutral-400">
      {entries.length > 0 && <h2 className="mb-3 text-center text-neutral-200">Top 5</h2>}
      {entries.length > 0 && (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li key={entry.id} className="flex gap-4"><span>{index + 1}.</span><span className="text-neutral-200">{entry.initials}</span><span className="ml-auto tabular-nums text-neutral-200">{entry.score}</span></li>
          ))}
        </ol>
      )}
      {qualifies && !isDone && (
        <form className="mt-4 text-center" onSubmit={async (event) => {
          event.preventDefault()
          if (isSaving) return
          if (!/^[A-Z]{3}$/.test(initials)) { setMessage('Enter three letters.'); return }
          if (['ASS', 'FCK', 'SHT', 'SEX'].includes(initials)) { setMessage('Please choose different initials.'); return }
          setIsSaving(true)
          setMessage('')
          try {
            const service = await import('../lib/leaderboard')
            const result = await service.saveScore(initials, score, runId)
            setEntries(result)
            setIsDone(true)
            setMessage('Score saved!')
          } catch (error) {
            setMessage(error instanceof Error && !('code' in error) ? error.message : 'Could not save. Please retry.')
          } finally { setIsSaving(false) }
        }}>
          <label htmlFor="snake-initials" className="mb-2 block">Top score! Your initials</label>
          <div className="flex justify-center gap-2">
            <input id="snake-initials" value={initials} onChange={(event) => { setInitials(event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)); setMessage('') }} maxLength={3} minLength={3} pattern="[A-Z]{3}" required autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={isSaving} aria-describedby="snake-leaderboard-status" className="w-20 rounded border border-white/25 bg-[#07090d]/90 px-2 py-2 text-center text-neutral-100 focus-visible:outline-2 focus-visible:outline-white" />
            <button type="submit" disabled={isSaving} className={buttonClass}>{isSaving ? 'Saving…' : 'Save'}</button>
            <button type="button" disabled={isSaving} className={buttonClass} onClick={() => { setIsDone(true); setMessage('') }}>Skip</button>
          </div>
        </form>
      )}
      <p id="snake-leaderboard-status" role="status" className="mt-2 text-center">{message}</p>
    </section>
  )
}
