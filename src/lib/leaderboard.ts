import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { collection, doc, getDocs, getFirestore, limit, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore'

export type LeaderboardEntry = { id: string; initials: string; score: number }

// Firebase web configuration is public; environment variables can override it.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB1cQvZ3xZudG17VkEONuye82CJZML9Ia4'
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'snake-leaderboard-a2f14'
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`

const app = initializeApp({ apiKey, projectId, authDomain })
const db = getFirestore(app)
const scores = collection(db, 'snakeScores')

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const snapshot = await getDocs(query(scores, orderBy('score', 'desc'), limit(5)))
  return snapshot.docs.map((entry) => ({ id: entry.id, initials: entry.data().initials as string, score: entry.data().score as number }))
}

export async function saveScore(initials: string, score: number, runId: string): Promise<LeaderboardEntry[]> {
  if (!/^[A-Z]{3}$/.test(initials) || ['ASS', 'FCK', 'SHT', 'SEX'].includes(initials)) {
    throw new Error('Please choose different initials.')
  }
  if (!Number.isSafeInteger(score) || score <= 0) throw new Error('Invalid score.')
  const auth = getAuth(app)
  await auth.authStateReady()
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user
  const entries = await loadLeaderboard()
  await runTransaction(db, async (transaction) => {
    const reference = doc(scores, runId)
    const previous = await transaction.get(reference)
    if (previous.exists()) return
    if (entries.length === 5 && score <= entries[4].score) throw new Error('The top five changed. Try again next game!')
    transaction.set(reference, { initials, score, userId: user.uid, updatedAt: serverTimestamp() })
  })
  return loadLeaderboard()
}
