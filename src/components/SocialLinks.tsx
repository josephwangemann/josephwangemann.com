import sunriseAvatar from '../assets/sunrise-avatar.jpeg'

const labelClass = 'pointer-events-none invisible absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap text-xs text-neutral-300 opacity-0 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100'

export function SocialLinks() {
  return (
    <nav className="relative z-10 flex items-center gap-4" aria-label="Social links">
      <a
        href="https://www.linkedin.com/in/josephwangemann/"
        aria-label="LinkedIn"
        target="_blank"
        rel="noreferrer"
        className="group social-entrance social-icon social-icon--bloom grid size-10 place-items-center rounded-full border border-[#70b7f5] text-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100"
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M5.37 3.5a1.87 1.87 0 1 1 0 3.74 1.87 1.87 0 0 1 0-3.74ZM3.75 8.75H7v11.5H3.75V8.75ZM9 8.75h3.11v1.57h.04c.43-.82 1.49-1.69 3.07-1.69 3.29 0 3.9 2.17 3.9 4.99v6.63h-3.24v-5.88c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v5.98H8.43V8.75H9Z"
          />
        </svg>
        <span aria-hidden="true" className={labelClass}>LinkedIn</span>
      </a>
      <a
        href="https://github.com/josephwangemann"
        aria-label="GitHub"
        target="_blank"
        rel="noreferrer"
        className="group social-entrance social-entrance--delayed social-icon social-icon--bloom size-10 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100"
      >
        <img src={sunriseAvatar} alt="" className="size-full rounded-full object-cover object-center" />
        <span aria-hidden="true" className={labelClass}>GitHub</span>
      </a>
    </nav>
  )
}
