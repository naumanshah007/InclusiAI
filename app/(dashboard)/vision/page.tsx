'use client';

import Link from 'next/link';
import { VisionAssistant } from '@/components/features/VisionAssistant/VisionAssistant';
import { ProfileFeatureGuard } from '@/components/features/ProfileFeatureGuard';
import { ProfileNavigation } from '@/components/navigation/ProfileNavigation';
import { ROUTES, APP_NAME } from '@/lib/constants';

export default function VisionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <ProfileNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-primary-50/30 py-8" role="main">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 font-display text-4xl font-bold text-gray-900">
              Vision Assistance
            </h1>
            <p className="text-lg text-gray-600">
              Get AI-powered descriptions of images, extract text from documents,
              and understand your surroundings. Perfect for reading medicine labels,
              signs, menus, and more.
            </p>
          </div>
              <ProfileFeatureGuard featureRoute={ROUTES.VISION}>
                <VisionAssistant />
              </ProfileFeatureGuard>
        </div>
      </main>
    </div>
  );
}

