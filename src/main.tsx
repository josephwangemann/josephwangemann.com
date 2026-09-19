import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anta'
import './index.css'
import App from './App.tsx'

console.log('Sup nerds!')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
