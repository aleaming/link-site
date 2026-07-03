interface LogoMarkProps {
  size?: number
  className?: string
}

/**
 * Fixed-brand icon badge (Electric cyan/lime on charcoal) — deliberately
 * NOT palette-reactive. A two-tone accent mark needs guaranteed contrast
 * against its own background; letting it recolor per active theme broke
 * down in several palette/mode combinations (e.g. lime on Electric's pale
 * light-mode background). The badge fixes the background instead, the way
 * app icons for themeable products (Slack, Discord) stay constant.
 */
export function LogoMark({ size = 36, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#1b1c1f" />
      <path
        d="M13.5 8H11.2A2.7 2.7 0 0 0 8.5 10.7V14M8.5 18V21.3A2.7 2.7 0 0 0 11.2 24H13.5"
        stroke="#33e5ff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 8H20.8A2.7 2.7 0 0 1 23.5 10.7V14M23.5 18V21.3A2.7 2.7 0 0 1 20.8 24H18.5"
        stroke="#33e5ff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16H12L14 12L16 20L18 12L20 16H27"
        stroke="#e9ff33"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
