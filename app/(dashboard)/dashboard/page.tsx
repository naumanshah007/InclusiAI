'use client';

import Link from 'next/link';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { ProfileDashboard } from '@/components/dashboard/ProfileDashboard';
import { ProfileNavigation } from '@/components/navigation/ProfileNavigation';
import { EmergencyButton } from '@/components/features/Emergency/EmergencyButton';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Emergency Button - Always Visible */}
      <EmergencyButton />

      {/* Header */}
      <header
        className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-30"
        role="banner"
      >
        <div className="container mx-auto px-4 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <ProfileNavigation />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-primary-50/30 py-8" role="main">
        <div className="container mx-auto px-4">
          {/* Profile-Specific Dashboard */}
          <ProfileDashboard />
        </div>
      </main>
    </div>
  );
}

