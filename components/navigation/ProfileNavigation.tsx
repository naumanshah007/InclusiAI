'use client';

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
      className={`flex items-center justify-between ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {showLogo && <BannerLogo />}
      <div className="flex items-center gap-2 flex-wrap">
        {availableLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2"
            aria-label={link.label}
          >
            {link.icon && <span>{link.icon}</span>}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

