'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/lib/store/user-profile';
import { useAuthStore } from '@/lib/store/auth-store';
import { ROUTES } from '@/lib/constants';
import { canAccessFeature } from '@/lib/utils/profile-features';
import { BannerLogo } from '@/components/branding/BannerLogo';

interface NavLink {
  href: string;
  label: string;
  icon?: string;
  adminOnly?: boolean;
}

interface ProfileNavigationProps {
  className?: string;
  showLogo?: boolean;
}

export function ProfileNavigation({ className = '', showLogo = true }: ProfileNavigationProps) {
  const { profileId } = useUserProfile();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define all navigation links
  const allLinks: NavLink[] = [
    { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { href: ROUTES.VOICE_ASSISTANT, label: 'Voice Assistant', icon: '🎤' },
    { href: ROUTES.VISION, label: 'Vision', icon: '👁️' },
    { href: ROUTES.HEARING, label: 'Hearing', icon: '👂' },
    { href: ROUTES.MOTOR, label: 'Motor', icon: '🦾' },
    { href: ROUTES.COGNITIVE, label: 'Cognitive', icon: '🧠' },
    { href: ROUTES.SPEECH, label: 'Speech', icon: '💬' },
    { href: ROUTES.EMERGENCY, label: 'Emergency', icon: '🚨' },
    { href: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️' },
    { href: ROUTES.ADMIN, label: 'Admin', icon: '🔧', adminOnly: true },
  ];

  // Filter links based on profile and admin status
  const availableLinks = allLinks.filter((link) => {
    // Admin can see everything
    if (isAdmin) return true;
    
    // Admin-only links are hidden for non-admins
    if (link.adminOnly) return false;
    
    // Emergency and Settings are always available
    if (link.href === ROUTES.EMERGENCY || link.href === ROUTES.SETTINGS || link.href === ROUTES.DASHBOARD) {
      return true;
    }
    
    // Check if feature is available for this profile
    return canAccessFeature(profileId, link.href);
  });

  return (
    <nav
      className={`flex items-center justify-between w-full ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {showLogo && <BannerLogo />}
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {availableLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2 min-h-[44px]"
            aria-label={link.label}
          >
            {link.icon && <span className="text-base">{link.icon}</span>}
            <span className="hidden lg:inline">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden">
          <div className="flex flex-col py-2">
            {availableLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3 min-h-[44px] border-b border-gray-100 last:border-b-0"
                aria-label={link.label}
              >
                {link.icon && <span className="text-xl">{link.icon}</span>}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

