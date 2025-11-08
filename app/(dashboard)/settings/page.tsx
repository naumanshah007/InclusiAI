'use client';

import Link from 'next/link';
import { SettingsPanel } from '@/components/features/SettingsPanel/SettingsPanel';
import { ProfileNavigation } from '@/components/navigation/ProfileNavigation';
import { ROUTES, APP_NAME } from '@/lib/constants';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-30">
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
          <h1 className="mb-2 font-display text-4xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Customize your accessibility preferences, API keys, and app settings.
          </p>
          <SettingsPanel />
        </div>
      </main>
    </div>
  );
}

