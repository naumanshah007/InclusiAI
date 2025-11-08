'use client';

import { useUserPreferences } from '@/lib/store/user-preferences';
import { ACCESSIBILITY_CONFIG } from '@/config/accessibility';
import type { DisabilityType } from '@/types';
import { APIKeysSection } from './APIKeysSection';
import { UserProfileSection } from './UserProfileSection';
import { ProfileSelectionSection } from './ProfileSelectionSection';
import { EmergencyContactsSection } from './EmergencyContactsSection';

export function SettingsPanel() {
  const preferences = useUserPreferences();

  const disabilityTypes: DisabilityType[] = [
    'visual',
    'hearing',
    'motor',
    'cognitive',
    'speech',
    'multiple',
    'none',
  ];

  const toggleDisabilityType = (type: DisabilityType) => {
    const current = preferences.disabilityTypes;
    if (current.includes(type)) {
      preferences.setDisabilityTypes(
        current.filter((t) => t !== type)
      );
    } else {
      preferences.setDisabilityTypes([...current, type]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Selection Section */}
      <ProfileSelectionSection />

      {/* User Profile Section */}
      <UserProfileSection />

      {/* API Keys Section */}
      <APIKeysSection />

      {/* Emergency Contacts Section */}
      <EmergencyContactsSection />

      {/* Disability Types */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Disability Types (Optional)
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Select the types of disabilities you have. This helps us customize
          your experience.
        </p>
        <div className="flex flex-wrap gap-3">
          {disabilityTypes.map((type) => (
            <button
              key={type}
              onClick={() => toggleDisabilityType(type)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                preferences.disabilityTypes.includes(type)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={preferences.disabilityTypes.includes(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Font Size */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Font Size</h2>
        <div className="space-y-4">
          <label
            htmlFor="font-size"
            className="block text-sm font-medium text-gray-700"
          >
            Font Size: {preferences.fontSize}px
          </label>
          <input
            id="font-size"
            type="range"
            min={ACCESSIBILITY_CONFIG.FONT_SIZES.MIN}
            max={ACCESSIBILITY_CONFIG.FONT_SIZES.MAX}
            step={ACCESSIBILITY_CONFIG.FONT_SIZES.STEP}
            value={preferences.fontSize}
            onChange={(e) =>
              preferences.setFontSize(parseInt(e.target.value))
            }
            className="w-full"
            aria-label="Font size slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>
      </section>

      {/* Contrast Mode */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Contrast Mode
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {(['normal', 'high', 'dark', 'light'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => preferences.setContrastMode(mode)}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                preferences.contrastMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={preferences.contrastMode === mode}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Layout Density */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Layout Density
        </h2>
        <div className="flex gap-3">
          {(['compact', 'normal', 'spacious'] as const).map((density) => (
            <button
              key={density}
              onClick={() => preferences.setLayoutDensity(density)}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                preferences.layoutDensity === density
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={preferences.layoutDensity === density}
            >
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Accessibility Options */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Accessibility Options
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Reduced Motion
            </span>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => preferences.setReducedMotion(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Voice Navigation
            </span>
            <input
              type="checkbox"
              checked={preferences.voiceNavigation}
              onChange={(e) =>
                preferences.setVoiceNavigation(e.target.checked)
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Haptic Feedback
            </span>
            <input
              type="checkbox"
              checked={preferences.hapticFeedback}
              onChange={(e) =>
                preferences.setHapticFeedback(e.target.checked)
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Audio Feedback
            </span>
            <input
              type="checkbox"
              checked={preferences.audioFeedback}
              onChange={(e) =>
                preferences.setAudioFeedback(e.target.checked)
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </section>

      {/* AI Provider */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          AI Provider
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Select which AI provider to use. Gemini is available for free.
        </p>
        <div className="flex gap-3">
          {(['gemini', 'openai', 'claude'] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => preferences.setAIProvider(provider)}
              disabled={provider !== 'gemini'} // Only Gemini available for now
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                preferences.aiProvider === provider
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-pressed={preferences.aiProvider === provider}
              aria-disabled={provider !== 'gemini'}
            >
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
              {provider !== 'gemini' && ' (Coming Soon)'}
            </button>
          ))}
        </div>
      </section>

      {/* Reset Button */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <button
          onClick={() => preferences.reset()}
          className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
        >
          Reset to Defaults
        </button>
      </section>
    </div>
  );
}

