'use client';

import Link from 'next/link';
import { ROUTES, APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

interface BannerLogoProps {
  href?: string | null;
  className?: string;
  showTagline?: boolean;
}

export function BannerLogo({ 
  href = ROUTES.HOME,
  className = '',
  showTagline = true
}: BannerLogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <svg
          width="56"
          height="56"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bannerIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="bannerIconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          
          <circle cx="32" cy="32" r="30" fill="url(#bannerIconGradient)" />
          <circle cx="32" cy="32" r="20" fill="url(#bannerIconGradient2)" opacity="0.95" />
          
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
      </div>
      
      {/* Text Content */}
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-gray-900 leading-tight">
          {APP_NAME}
        </span>
        {showTagline && (
          <span className="text-sm text-gray-600 mt-0.5 leading-tight">
            {APP_DESCRIPTION}
          </span>
        )}
      </div>
    </div>
  );

  // If href is null, don't wrap in Link
  if (href === null) {
    return logoContent;
  }

  // Otherwise, wrap in Link
  return (
    <Link
      href={href}
      className="flex items-center"
      aria-label={`${APP_NAME} home`}
    >
      {logoContent}
    </Link>
  );
}

