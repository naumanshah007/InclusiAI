'use client';

import { useEffect } from 'react';
import { useUserPreferences } from '@/lib/store/user-preferences';

/**
 * Accessibility Wrapper Component
 * Applies user accessibility preferences to the app
 */
export function AccessibilityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    fontSize,
    contrastMode,
    reducedMotion,
    layoutDensity,
  } = useUserPreferences();

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Apply reduced motion preference
    if (reducedMotion) {
      document.documentElement.style.setProperty(
        '--motion-duration',
        '0ms'
      );
    }

    // Apply layout density
    const densityClasses = {
      compact: 'density-compact',
      normal: 'density-normal',
      spacious: 'density-spacious',
    };
    document.documentElement.className = densityClasses[layoutDensity];

    // Apply contrast mode
    const contrastClasses = {
      normal: '',
      high: 'contrast-high',
      dark: 'dark',
      light: 'contrast-light',
      custom: '',
    };
    if (contrastMode !== 'normal' && contrastMode !== 'custom') {
      document.documentElement.classList.add(contrastClasses[contrastMode]);
    }
  }, [fontSize, contrastMode, reducedMotion, layoutDensity]);

  return <>{children}</>;
}

