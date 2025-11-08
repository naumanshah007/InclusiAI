'use client';

import { VoiceFirstInterface } from '@/components/features/VoiceAssistant/VoiceFirstInterface';
import { ProfileFeatureGuard } from '@/components/features/ProfileFeatureGuard';
import { ProfileNavigation } from '@/components/navigation/ProfileNavigation';
import { ROUTES } from '@/lib/constants';

export default function VoiceAssistantPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-30 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <ProfileNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1" role="main">
        <ProfileFeatureGuard featureRoute={ROUTES.VISION}>
          <VoiceFirstInterface />
        </ProfileFeatureGuard>
      </main>
    </div>
  );
}

