import { CustomCursor } from './CustomCursor'

const errorCode = String.raw`
 _  _    ___   _  _
| || |  / _ \ | || |
| || |_| | | || || |_
|__   _| |_| ||__   _|
   |_|  \___/    |_|
`.slice(1, -1)

export function NotFound() {
  return (
    <main className="ambient-background flex min-h-svh items-center justify-center px-6 py-12">
      <CustomCursor />
      <section aria-labelledby="not-found-title" className="not-found-terminal relative w-full max-w-xl overflow-hidden rounded-md border border-[#a3e6b1]/20 bg-black/35 p-6 font-mono text-sm leading-relaxed text-neutral-400 sm:p-10">
        <p className="mb-10 border-b border-[#a3e6b1]/15 pb-4 text-[0.65rem] tracking-widest text-[#a3e6b1]/60">JOSEPHWANGEMANN.COM / TTY-01</p>
        <pre aria-hidden="true" className="mb-8 text-[clamp(0.8rem,3.5vw,1.3rem)] leading-tight text-[#a3e6b1] drop-shadow-[0_0_12px_rgba(163,230,177,0.2)]">{errorCode}</pre>
        <h1 id="not-found-title" className="mb-6 text-lg text-neutral-100">404: page not found</h1>
        <p className="break-all"><span aria-hidden="true" className="text-[#a3e6b1]">$ </span>open {window.location.pathname}</p>
        <p className="mt-2">ENOENT: no such page or directory.</p>
        <a href="/" aria-label="cd / — return home" className="mt-10 inline-flex min-h-11 items-center gap-3 rounded-sm text-[#a3e6b1] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3e6b1]">
          <span aria-hidden="true">$</span>
          <span>cd /</span>
          <span aria-hidden="true" className="not-found-caret inline-block h-4 w-2 bg-[#a3e6b1]" />
        </a>
      </section>
    </main>
  )
}
