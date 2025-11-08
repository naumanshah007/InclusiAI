import type { Metadata } from 'next';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AccessibilityWrapper } from '@/components/accessibility/AccessibilityWrapper';
import { ServiceWorkerRegistration } from '@/components/accessibility/ServiceWorkerRegistration';
import { PWAInstallPrompt } from '@/components/accessibility/PWAInstallPrompt';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_DESCRIPTION}`,
  description:
    'AI-powered accessibility assistant designed to help people with disabilities navigate daily life with confidence and independence. Vision, hearing, motor, cognitive, and speech assistance.',
  keywords: [
    'accessibility',
    'disability',
    'AI assistant',
    'visual impairment',
    'hearing impairment',
    'assistive technology',
    'inclusivity',
    'accessibility app',
    'disability support',
  ],
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <AccessibilityWrapper>
            <ProfileLayout>
              {children}
            </ProfileLayout>
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />
          </AccessibilityWrapper>
        </Providers>
      </body>
    </html>
  );
}
