# josephwangemann.com

## Scope

This is Joseph Wangemann's personal portfolio site: a minimal React + TypeScript + Vite single page deployed through Cloudflare Pages. Make only the requested change. Preserve the deliberately sparse presentation; do not add copy, sections, dependencies, or decorative UI without an explicit request.

## Commands and Git

- Development: `npm run dev`
- Production build: `npm run build` (`tsc -b && vite build`)
- Lint: `npm run lint` (Oxlint)
- Do not run build, lint, or tests unless the user asks for verification.
- Do not commit, push, create a PR, merge, or deploy unless the user explicitly requests it in the current turn.
- Cloudflare Pages deploys pushes to `main` automatically. Use a PR by default only when the user asks for one; push directly to `main` only when explicitly instructed.

## Structure

```text
src/
  App.tsx                    # Page composition and staged reveal orchestration
  components/
    Hero.tsx                 # Animated title
    SocialLinks.tsx          # LinkedIn and GitHub links
    SnakeGame.tsx            # Snake presentation and game UI
    SnakeControlsHint.tsx    # Keyboard/swipe hint
    GameOverControls.tsx     # Restart/hide controls
    CustomCursor.tsx         # Desktop DOM-tracked cursor
  hooks/
    useSnakeGame.ts          # Snake state, drawing, input, resizing, scoring
  constants/
    animation.ts             # Reveal timing source of truth
  assets/
public/
  favicon.svg
  robots.txt
  sitemap.xml
```

Keep page composition in `App.tsx`, reusable visual pieces in `components/`, and game mechanics/canvas effects in `useSnakeGame.ts`. Do not collapse these responsibilities back into `App.tsx`.

## Visual and interaction conventions

- Tailwind v4 is imported through `src/index.css`; use utility classes for component-local styling and `index.css` for shared keyframes/global rules.
- The ambient dark gradient, Anta title, and sparse layout are intentional.
- `Press Start 2P` is reserved for Snake UI and high-score text.
- Preserve the landing sequence defined in `src/constants/animation.ts`: title → social icons → Snake board → gameplay.
- Social links open in new tabs. LinkedIn is the blue outlined icon; GitHub uses the circular sunrise image.
- The desktop cursor is implemented as `CustomCursor`, not a CSS `cursor: url(...)` rule. Keep it `pointer-events: none` and hidden on coarse/touch pointers.

## Snake conventions

- Snake is part of the primary experience on desktop and mobile.
- Desktop uses arrow keys; mobile uses directional swipes. Keep both input paths working.
- The board must fill the available inset area with normal margins on every edge. Do not restore a fixed CSS aspect ratio.
- `useSnakeGame` derives columns and rows from the measured board size so cells remain near-square at every viewport size. Larger screens intentionally use larger target cells.
- Canvas effects are deliberately restrained: a short tail trail, a small food-particle burst, and a pulsing food square. When the game ends, its animation clock freezes.
- High score lasts only for the current page session. Do not add persistence unless asked.
- Keep the game-over keyboard flow: up/down selects Restart or Hide Snake; Enter activates the selected action. When Snake is hidden on desktop, Enter reopens it.
- Snake is behind the title/social layer; game-over controls render below the title and social links.

## Content and SEO

- Canonical public identity: **Joseph Wangemann — Software Engineer**.
- Keep `index.html`, `robots.txt`, and `sitemap.xml` coherent if public metadata or URLs change.
- Do not change external profile URLs without an explicit user-provided replacement.

## Change discipline

- Prefer the smallest focused edit and retain existing naming/timing conventions.
- Keep TypeScript strict-clean: avoid unused locals/imports, especially in animation callbacks.
- Do not introduce a design system, router, state library, analytics, or backend unless explicitly requested.
