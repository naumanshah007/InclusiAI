'use client';

import Link from 'next/link';
import { ROUTES, APP_NAME } from '@/lib/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  href?: string | null; // If null, don't wrap in Link (for when already wrapped)
}

export function Logo({ 
  size = 'lg', // Changed default from 'md' to 'lg' for bigger logo
  showText = true, 
  className = '',
  href = ROUTES.HOME // Default to home, but can be overridden or set to null
}: LogoProps) {
  const iconSizes = {
    sm: { width: 40, height: 40, viewBox: '0 0 64 64' },
    md: { width: 56, height: 56, viewBox: '0 0 64 64' },
    lg: { width: 72, height: 72, viewBox: '0 0 64 64' },
    xl: { width: 96, height: 96, viewBox: '0 0 64 64' },
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const iconSize = iconSizes[size];

  // Logo Icon SVG - Represents accessibility, inclusivity, and AI
  const LogoIcon = () => (
    <svg
      width={iconSize.width}
      height={iconSize.height}
      viewBox={iconSize.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform hover:scale-105 drop-shadow-lg"
      aria-hidden="true"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id={`logoGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id={`logoGradient2-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter id={`shadow-${size}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer circle - represents inclusivity and community */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={`url(#logoGradient-${size})`}
        filter={`url(#shadow-${size})`}
      />
      
      {/* Inner circle - represents the individual */}
      <circle
        cx="32"
        cy="32"
        r="20"
        fill={`url(#logoGradient2-${size})`}
        opacity="0.95"
      />
      
      {/* Accessibility symbol - person with arms raised (simplified) */}
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Head */}
        <circle cx="32" cy="18" r="3" fill="white" />
        {/* Body */}
        <path d="M32 21 L32 35" />
        {/* Arms raised (accessibility symbol) */}
        <path d="M32 25 L28 22 M32 25 L36 22" />
        {/* Legs */}
        <path d="M32 35 L28 42 M32 35 L36 42" />
      </g>
      
      {/* AI/Technology elements - small dots representing AI assistance */}
      <circle cx="18" cy="18" r="1.5" fill="white" opacity="0.9" />
      <circle cx="46" cy="18" r="1.5" fill="white" opacity="0.9" />
      <circle cx="18" cy="46" r="1.5" fill="white" opacity="0.9" />
      <circle cx="46" cy="46" r="1.5" fill="white" opacity="0.9" />
      
      {/* Connecting lines - representing support and connection */}
      <path
        d="M18 18 L26 24 M46 18 L38 24 M18 46 L26 40 M46 46 L38 40"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );

  const logoContent = (
    <>
      <div className="flex items-center justify-center">
        <LogoIcon />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold text-gray-900 ${textSizeClasses[size]} leading-tight`}>
            {APP_NAME}
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className={`text-gray-500 mt-0.5 ${size === 'xl' ? 'text-sm' : 'text-xs'}`}>
              Empowering Independence Through AI
            </span>
          )}
        </div>
      )}
    </>
  );

  // If href is null, don't wrap in Link (for when already wrapped)
  if (href === null) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {logoContent}
      </div>
    );
  }

  // Otherwise, wrap in Link
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 ${className}`} // Increased gap from 3 to 4 for better spacing
      aria-label={`${APP_NAME} home`}
    >
      {logoContent}
    </Link>
  );
}
