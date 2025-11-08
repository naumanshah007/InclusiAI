/**
 * User Profile Type Definitions
 * Defines all user profiles and their characteristics
 */

export type UserProfileType =
  | 'visual' // Blind/Low Vision
  | 'hearing' // Deaf/Hard of Hearing
  | 'motor' // Limited Mobility/Paralysis/Tremors
  | 'cognitive' // Dementia/Learning Disabilities/ADHD
  | 'speech' // Mute/Stuttering/Aphasia
  | 'elderly' // Multiple needs, technology challenges
  | 'multiple' // Multiple disabilities
  | 'admin' // Admin access to all features
  | 'general'; // General/No specific disability

export interface UserProfile {
  id: UserProfileType;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[]; // Available feature routes
  uiPreferences: {
    fontSize: number;
    contrastMode: 'normal' | 'high' | 'dark' | 'light';
    layoutDensity: 'compact' | 'normal' | 'spacious';
    voiceNavigation: boolean;
    hapticFeedback: boolean;
    audioFeedback: boolean;
    reducedMotion: boolean;
  };
  needs: string[];
  hiddenFeatures: string[]; // Features to hide
}

export const USER_PROFILES: Record<UserProfileType, UserProfile> = {
  visual: {
    id: 'visual',
    name: 'Visual Impairment',
    description: 'For people who are blind or have low vision',
    icon: '👁️',
    color: 'from-blue-500 to-blue-600',
    features: ['/vision', '/hearing', '/speech', '/emergency', '/cognitive', '/voice-assistant'],
    uiPreferences: {
      fontSize: 20,
      contrastMode: 'high',
      layoutDensity: 'spacious',
      voiceNavigation: true,
      hapticFeedback: true,
      audioFeedback: true,
      reducedMotion: false,
    },
    needs: [
      'Screen reader support',
      'Voice navigation',
      'Audio descriptions',
      'Text-to-speech',
      'High contrast',
    ],
    hiddenFeatures: [],
  },
  hearing: {
    id: 'hearing',
    name: 'Hearing Impairment',
    description: 'For people who are deaf or hard of hearing',
    icon: '👂',
    color: 'from-green-500 to-green-600',
    features: ['/hearing', '/vision', '/speech', '/cognitive', '/emergency'],
    uiPreferences: {
      fontSize: 18,
      contrastMode: 'normal',
      layoutDensity: 'normal',
      voiceNavigation: false,
      hapticFeedback: true,
      audioFeedback: false,
      reducedMotion: false,
    },
    needs: [
      'Real-time captions',
      'Live speech-to-text',
      'Sound awareness',
      'Visual/tactile alerts',
      'Conversation bridge',
      'Call captioning',
      'Announcement capture',
      'Audio transcription',
      'Haptic feedback',
    ],
    hiddenFeatures: [],
  },
  motor: {
    id: 'motor',
    name: 'Motor Impairment',
    description: 'For people with limited mobility, paralysis, or tremors',
    icon: '🦾',
    color: 'from-purple-500 to-purple-600',
    features: ['/motor', '/speech', '/cognitive', '/emergency', '/vision'],
    uiPreferences: {
      fontSize: 18,
      contrastMode: 'normal',
      layoutDensity: 'spacious',
      voiceNavigation: true,
      hapticFeedback: true,
      audioFeedback: true,
      reducedMotion: false,
    },
    needs: [
      'Voice commands',
      'Large touch targets',
      'Hands-free operation',
      'Adaptive input',
      'Simplified interactions',
    ],
    hiddenFeatures: [],
  },
  cognitive: {
    id: 'cognitive',
    name: 'Cognitive Impairment',
    description: 'For people with dementia, learning disabilities, or ADHD',
    icon: '🧠',
    color: 'from-orange-500 to-orange-600',
    features: ['/cognitive', '/speech', '/emergency', '/vision'],
    uiPreferences: {
      fontSize: 20,
      contrastMode: 'normal',
      layoutDensity: 'spacious',
      voiceNavigation: false,
      hapticFeedback: false,
      audioFeedback: false,
      reducedMotion: true,
    },
    needs: [
      'Simplified interfaces',
      'Clear instructions',
      'Reminders',
      'Task breakdown',
      'Text simplification',
    ],
    hiddenFeatures: [],
  },
  speech: {
    id: 'speech',
    name: 'Speech Impairment',
    description: 'For people who are mute, stutter, or have aphasia',
    icon: '💬',
    color: 'from-pink-500 to-pink-600',
    features: ['/speech', '/vision', '/cognitive', '/emergency'],
    uiPreferences: {
      fontSize: 18,
      contrastMode: 'normal',
      layoutDensity: 'normal',
      voiceNavigation: false,
      hapticFeedback: true,
      audioFeedback: false,
      reducedMotion: false,
    },
    needs: [
      'Communication boards',
      'Tap-to-talk phrases',
      'Type-to-speak',
      'Smart phrase prediction',
      'Personal voice banking',
      'Access methods (switch, scanning, eye-tracking)',
      'Conversation bridge',
      'Context-aware routines',
      'AI vision integration',
      'Text-to-speech',
    ],
    hiddenFeatures: [],
  },
  elderly: {
    id: 'elderly',
    name: 'Elderly Assistance',
    description: 'For elderly people who need help with daily tasks',
    icon: '👴',
    color: 'from-amber-500 to-amber-600',
    features: [
      '/vision',
      '/hearing',
      '/motor',
      '/cognitive',
      '/speech',
      '/emergency',
    ],
    uiPreferences: {
      fontSize: 24,
      contrastMode: 'high',
      layoutDensity: 'spacious',
      voiceNavigation: true,
      hapticFeedback: true,
      audioFeedback: true,
      reducedMotion: true,
    },
    needs: [
      'Large text',
      'Simple navigation',
      'Reminders',
      'Medication tracking',
      'Emergency assistance',
    ],
    hiddenFeatures: [],
  },
  multiple: {
    id: 'multiple',
    name: 'Multiple Disabilities',
    description: 'For people with multiple disabilities',
    icon: '♿',
    color: 'from-indigo-500 to-indigo-600',
    features: [
      '/vision',
      '/hearing',
      '/motor',
      '/cognitive',
      '/speech',
      '/emergency',
    ],
    uiPreferences: {
      fontSize: 20,
      contrastMode: 'high',
      layoutDensity: 'spacious',
      voiceNavigation: true,
      hapticFeedback: true,
      audioFeedback: true,
      reducedMotion: true,
    },
    needs: [
      'Combination of features',
      'Customizable interface',
      'Adaptive assistance',
    ],
    hiddenFeatures: [],
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and user management',
    icon: '⚙️',
    color: 'from-gray-600 to-gray-700',
    features: [
      '/vision',
      '/hearing',
      '/motor',
      '/cognitive',
      '/speech',
      '/emergency',
      '/admin',
    ],
    uiPreferences: {
      fontSize: 16,
      contrastMode: 'normal',
      layoutDensity: 'normal',
      voiceNavigation: false,
      hapticFeedback: false,
      audioFeedback: false,
      reducedMotion: false,
    },
    needs: [
      'Full feature access',
      'User management',
      'Analytics',
      'System configuration',
    ],
    hiddenFeatures: [],
  },
  general: {
    id: 'general',
    name: 'General Use',
    description: 'General accessibility features for everyone',
    icon: '🌐',
    color: 'from-gray-400 to-gray-500',
    features: [
      '/vision',
      '/hearing',
      '/motor',
      '/cognitive',
      '/speech',
      '/emergency',
    ],
    uiPreferences: {
      fontSize: 16,
      contrastMode: 'normal',
      layoutDensity: 'normal',
      voiceNavigation: false,
      hapticFeedback: true,
      audioFeedback: true,
      reducedMotion: false,
    },
    needs: ['General accessibility', 'All features available'],
    hiddenFeatures: [],
  },
};

export function getProfileById(id: UserProfileType): UserProfile {
  return USER_PROFILES[id] || USER_PROFILES.general;
}

export function getProfileFeatures(profileId: UserProfileType): string[] {
  return USER_PROFILES[profileId]?.features || USER_PROFILES.general.features;
}

export function isFeatureAvailable(
  profileId: UserProfileType,
  featureRoute: string
): boolean {
  const profile = getProfileById(profileId);
  return profile.features.includes(featureRoute);
}

