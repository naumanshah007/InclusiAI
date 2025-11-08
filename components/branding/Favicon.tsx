/**
 * Favicon Component
 * Generates a favicon for the app using the logo design
 */

export function Favicon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="faviconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      
      <circle cx="32" cy="32" r="30" fill="url(#faviconGradient)" />
      <circle cx="32" cy="32" r="20" fill="url(#faviconGradient2)" opacity="0.95" />
      
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="32" cy="18" r="3" fill="white" />
        <path d="M32 21 L32 35" />
        <path d="M32 25 L28 22 M32 25 L36 22" />
        <path d="M32 35 L28 42 M32 35 L36 42" />
      </g>
      
      <circle cx="18" cy="18" r="1.5" fill="white" opacity="0.9" />
      <circle cx="46" cy="18" r="1.5" fill="white" opacity="0.9" />
      <circle cx="18" cy="46" r="1.5" fill="white" opacity="0.9" />
      <circle cx="46" cy="46" r="1.5" fill="white" opacity="0.9" />
    </svg>
  );
}

