'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useUserProfile } from '@/lib/store/user-profile';
import { getQuickActionsForProfile } from '@/lib/utils/profile-features';

interface QuickAction {
  id: string;
  label: string;
  route: string;
  icon: string;
  color: string;
  description: string;
}

const quickActionsMap: Record<string, QuickAction> = {
  vision: {
    id: 'camera',
    label: 'Smart Camera',
    route: ROUTES.VISION,
    icon: '📷',
    color: 'from-primary-500 to-primary-600',
    description: 'Real-time scene description',
  },
  'voice-assistant': {
    id: 'voice-assistant',
    label: 'Voice Assistant',
    route: ROUTES.VOICE_ASSISTANT,
    icon: '🎤',
    color: 'from-blue-500 to-blue-600',
    description: 'Voice-first interface',
  },
  hearing: {
    id: 'transcribe',
    label: 'Live Transcription',
    route: ROUTES.HEARING,
    icon: '🎤',
    color: 'from-secondary-500 to-secondary-600',
    description: 'Speech to text',
  },
  motor: {
    id: 'voice',
    label: 'Voice Commands',
    route: ROUTES.MOTOR,
    icon: '🎙️',
    color: 'from-accent-500 to-accent-600',
    description: 'Hands-free control',
  },
  cognitive: {
    id: 'simplify',
    label: 'Simplify Text',
    route: ROUTES.COGNITIVE,
    icon: '📝',
    color: 'from-primary-500 to-secondary-600',
    description: 'Make text easier',
  },
  speech: {
    id: 'speak',
    label: 'Text to Speech',
    route: ROUTES.SPEECH,
    icon: '🔊',
    color: 'from-secondary-500 to-secondary-600',
    description: 'Read aloud',
  },
  emergency: {
    id: 'emergency',
    label: 'Emergency',
    route: ROUTES.EMERGENCY,
    icon: '🚨',
    color: 'from-emergency-500 to-emergency-600',
    description: 'Get help now',
  },
};

export function QuickAccessHub() {
  const { profileId } = useUserProfile();
  const availableFeatures = getQuickActionsForProfile(profileId);
  
  // Map features to quick actions using feature.id for unique mapping
  const quickActions = availableFeatures
    .map((feature) => {
      // Use feature.id first (for voice-assistant), then fall back to category
      return quickActionsMap[feature.id] || quickActionsMap[feature.category];
    })
    .filter(Boolean) as QuickAction[];
  
  // Remove duplicates based on id
  const uniqueQuickActions = quickActions.filter((action, index, self) =>
    index === self.findIndex((a) => a.id === action.id)
  );
  
  // Always include emergency if available
  if (!uniqueQuickActions.find((a) => a.id === 'emergency') && quickActionsMap.emergency) {
    uniqueQuickActions.unshift(quickActionsMap.emergency);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-2xl font-semibold text-gray-900">
        Quick Access
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {uniqueQuickActions.map((action) => (
          <Link
            key={action.id}
            href={action.route}
            className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={`${action.label}: ${action.description}`}
          >
            <div
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-2xl text-white shadow-lg transition-transform group-hover:scale-110`}
            >
              {action.icon}
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">{action.label}</h3>
            <p className="text-xs text-gray-500">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

