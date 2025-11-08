/**
 * Profile Features Utility
 * Maps profiles to available features and provides access control
 */

import type { UserProfileType } from '@/lib/types/user-profiles';
import { ROUTES } from '@/lib/constants';
import { getProfileById, isFeatureAvailable } from '@/lib/types/user-profiles';

export interface Feature {
  id: string;
  name: string;
  route: string;
  icon: string;
  description: string;
  category: 'vision' | 'hearing' | 'motor' | 'cognitive' | 'speech' | 'emergency' | 'admin';
}

export const ALL_FEATURES: Feature[] = [
  {
    id: 'vision',
    name: 'Vision Assistance',
    route: ROUTES.VISION,
    icon: '👁️',
    description: 'Image description, OCR, scene understanding',
    category: 'vision',
  },
  {
    id: 'voice-assistant',
    name: 'Voice Assistant',
    route: ROUTES.VOICE_ASSISTANT,
    icon: '🎤',
    description: 'Voice-first interface for blind users',
    category: 'vision',
  },
  {
    id: 'hearing',
    name: 'Hearing Assistance',
    route: ROUTES.HEARING,
    icon: '👂',
    description: 'Speech to text, real-time captioning',
    category: 'hearing',
  },
  {
    id: 'motor',
    name: 'Motor Assistance',
    route: ROUTES.MOTOR,
    icon: '🦾',
    description: 'Voice commands, hands-free control',
    category: 'motor',
  },
  {
    id: 'cognitive',
    name: 'Cognitive Assistance',
    route: ROUTES.COGNITIVE,
    icon: '🧠',
    description: 'Text simplification, task breakdown',
    category: 'cognitive',
  },
  {
    id: 'speech',
    name: 'Speech Assistance',
    route: ROUTES.SPEECH,
    icon: '💬',
    description: 'Communication board, text-to-speech',
    category: 'speech',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    route: ROUTES.EMERGENCY,
    icon: '🚨',
    description: 'Emergency assistance and help',
    category: 'emergency',
  },
];

export function getAvailableFeatures(profileId: UserProfileType | null): Feature[] {
  if (!profileId || profileId === 'admin') {
    return ALL_FEATURES;
  }
  
  const profile = getProfileById(profileId);
  return ALL_FEATURES.filter((feature) =>
    profile.features.includes(feature.route)
  );
}

export function canAccessFeature(
  profileId: UserProfileType | null,
  featureRoute: string
): boolean {
  if (!profileId || profileId === 'admin') {
    return true; // Admin can access everything
  }
  
  return isFeatureAvailable(profileId, featureRoute);
}

export function getQuickActionsForProfile(
  profileId: UserProfileType | null
): Feature[] {
  const availableFeatures = getAvailableFeatures(profileId);
  
  // Return top 6 most relevant features for the profile
  // Emergency is always first if available
  const emergency = availableFeatures.find((f) => f.id === 'emergency');
  const others = availableFeatures.filter((f) => f.id !== 'emergency');
  
  const quickActions = emergency ? [emergency, ...others.slice(0, 5)] : others.slice(0, 6);
  
  return quickActions;
}

