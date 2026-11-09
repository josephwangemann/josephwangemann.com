import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anta'
import '@fontsource/press-start-2p'
import './index.css'
import App from './App.tsx'
import { NotFound } from './components/NotFound'

console.log('%c' + String.raw`
   .------------.
   | Sup nerds! |
   '-----------. \
                \|
                 /^\/^\
               _|__|  O|
      \/     /~     \_/ \
       \____|__________/  \
              \_______     \
                      '\    \                 \
                        |    |                 \
                       /     /                  \
                      /    /                     \\
                    /     /                       \ \
                   /    /                          \  \
                 /    /             _----_          \   \
                /    /           _-~      ~-_        |   |
               (     (        _-~    _--_    ~-_     /   |
                \     ~-____-~    _-~    ~-_    ~-_-~   /
                  ~-_          _-~          ~-_      _-~
                     ~--_____-~                ~-__-~
`, 'color: #a3e6b1; font-family: monospace; line-height: 1.15;')

const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html'
if (!isHome) document.title = '404: Page not found — Joseph Wangemann'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isHome ? <App /> : <NotFound />}
  </StrictMode>,
)
