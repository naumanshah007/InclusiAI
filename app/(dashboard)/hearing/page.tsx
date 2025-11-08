'use client';

import Link from 'next/link';
import { HearingAssistant } from '@/components/features/HearingAssistant/HearingAssistant';
import { ROUTES } from '@/lib/constants';
import { BannerLogo } from '@/components/branding/BannerLogo';

export default function HearingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <BannerLogo />
            <Link
              href={ROUTES.SETTINGS}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">
            Hearing Assistance
          </h1>
          <p className="mb-8 text-gray-600">
            Real-time transcription, captioning, and audio alerts for hearing
            impaired users.
          </p>
          <HearingAssistant />
        </div>
      </main>
    </div>
  );
}

