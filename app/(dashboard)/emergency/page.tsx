'use client';

import Link from 'next/link';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { EmergencyFeatures } from '@/components/features/Emergency/EmergencyFeatures';
import { BannerLogo } from '@/components/branding/BannerLogo';

export default function EmergencyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className="border-b border-emergency-200 bg-gradient-to-r from-emergency-50 to-emergency-100"
        role="banner"
      >
        <div className="container mx-auto px-4 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <BannerLogo />
            <Link
              href={ROUTES.DASHBOARD}
              className="rounded-lg px-4 py-2 text-sm font-medium text-emergency-700 transition-colors hover:bg-emergency-200 hover:text-emergency-900"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-emergency-50 to-white py-8" role="main">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <section className="mb-8 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emergency-500 to-emergency-600 text-white shadow-2xl">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold text-emergency-900">
                Emergency Help
              </h1>
              <p className="text-lg text-emergency-700">
                Quick access to emergency assistance and critical features
              </p>
            </section>

            {/* Emergency Features */}
            <EmergencyFeatures />
          </div>
        </div>
      </main>
    </div>
  );
}

