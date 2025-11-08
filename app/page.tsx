import Link from 'next/link';
import { ROUTES, APP_NAME, APP_DESCRIPTION, APP_TAGLINE } from '@/lib/constants';
import { Logo } from '@/components/branding/Logo';
import { BannerLogo } from '@/components/branding/BannerLogo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip Link for Keyboard Navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header
        className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-40"
        role="banner"
      >
        <div className="container mx-auto px-4 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <BannerLogo />
            <div className="flex items-center gap-4">
              <Link
                href={ROUTES.LOGIN}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Sign in"
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.DASHBOARD}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Go to dashboard"
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.SETTINGS}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Go to settings"
              >
                Settings
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <Logo size="xl" className="justify-center" />
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-500"></span>
              Empowering Independence Through AI
            </div>
            <h1 className="mb-6 font-display text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
              {APP_NAME}
            </h1>
            <p className="mb-4 text-xl text-gray-600 md:text-2xl">
              {APP_DESCRIPTION}
            </p>
            <p className="mb-8 text-lg text-gray-500">
              Your intelligent companion for navigating daily life with confidence
              and independence
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={ROUTES.DASHBOARD}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Get started with InclusiAid"
              >
                Get Started
              </Link>
              <Link
                href={ROUTES.EMERGENCY}
                className="rounded-xl border-2 border-emergency-500 bg-emergency-50 px-8 py-4 text-lg font-semibold text-emergency-700 transition-all hover:bg-emergency-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emergency-500 focus:ring-offset-2"
                aria-label="Emergency assistance"
              >
                Emergency Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" className="flex-1 bg-gray-50 py-16" role="main">
        <div className="container mx-auto px-4">
          {/* Features Section */}
          <section className="mb-16">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-4xl font-bold text-gray-900">
                Comprehensive Assistance for Everyone
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Powerful AI-driven features designed to support people with
                disabilities in their daily lives
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Vision Assistance */}
              <Link
                href={ROUTES.VISION}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:scale-105 hover:shadow-xl"
                aria-label="Vision assistance features"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-gray-900">
                    Vision Assistance
                  </h3>
                  <p className="text-gray-600">
                    Real-time image description, text recognition, scene
                    understanding, and object identification for visually
                    impaired users.
                  </p>
                </div>
              </Link>

              {/* Hearing Assistance */}
              <Link
                href={ROUTES.HEARING}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:scale-105 hover:shadow-xl"
                aria-label="Hearing assistance features"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-lg">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-gray-900">
                    Hearing Assistance
                  </h3>
                  <p className="text-gray-600">
                    Real-time transcription, live captioning, audio alerts, and
                    conversation support for hearing impaired users.
                  </p>
                </div>
              </Link>

              {/* Motor Assistance */}
              <Link
                href={ROUTES.MOTOR}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:scale-105 hover:shadow-xl"
                aria-label="Motor assistance features"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-gray-900">
                    Motor Assistance
                  </h3>
                  <p className="text-gray-600">
                    Complete voice control, hands-free operation, adaptive input,
                    and gesture recognition for motor disabilities.
                  </p>
                </div>
              </Link>

              {/* Cognitive Assistance */}
              <Link
                href={ROUTES.COGNITIVE}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:scale-105 hover:shadow-xl"
                aria-label="Cognitive assistance features"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-lg">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-gray-900">
                    Cognitive Assistance
                  </h3>
                  <p className="text-gray-600">
                    Text simplification, task breakdown, memory aids, and
                    learning support for cognitive disabilities.
                  </p>
                </div>
              </Link>

              {/* Speech Assistance */}
              <Link
                href={ROUTES.SPEECH}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:scale-105 hover:shadow-xl"
                aria-label="Speech assistance features"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-lg">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-gray-900">
                    Speech Assistance
                  </h3>
                  <p className="text-gray-600">
                    Communication boards, text-to-speech, quick phrases, and
                    custom voice settings for speech disabilities.
                  </p>
                </div>
              </Link>

              {/* Emergency Assistance */}
              <Link
                href={ROUTES.EMERGENCY}
                className="group relative overflow-hidden rounded-2xl border-2 border-emergency-300 bg-gradient-to-br from-emergency-50 to-emergency-100 p-8 shadow-sm transition-all hover:scale-105 hover:shadow-xl"
                aria-label="Emergency assistance"
              >
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emergency-500 to-emergency-600 text-white shadow-lg">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold text-emergency-900">
                    Emergency Help
                  </h3>
                  <p className="text-emergency-700">
                    Quick access to emergency features, SOS communication, and
                    critical assistance when you need it most.
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="rounded-3xl bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-500 p-12 text-center text-white shadow-2xl">
            <h2 className="mb-4 font-display text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-xl text-white/90">
              Join thousands of users who trust InclusiAid for their daily
              accessibility needs
            </p>
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              aria-label="Go to dashboard"
            >
              Open Dashboard
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-gray-200 bg-white py-8"
        role="contentinfo"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 text-white">
                <span className="text-sm font-bold">IA</span>
              </div>
              <span className="font-display text-lg font-semibold text-gray-900">
                {APP_NAME}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {APP_DESCRIPTION} © {new Date().getFullYear()}
            </p>
            <div className="flex gap-4">
              <Link
                href={ROUTES.HELP}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Help
              </Link>
              <Link
                href={ROUTES.SETTINGS}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
