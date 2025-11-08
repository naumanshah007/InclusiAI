'use client';

import type { UserProfile } from '@/lib/types/user-profiles';

interface ProfileCardProps {
  profile: UserProfile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
}

export function ProfileCard({ profile, isSelected, onSelect }: ProfileCardProps) {
  return (
    <button
      onClick={() => onSelect(profile.id)}
      className={`group relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      aria-pressed={isSelected}
      aria-label={`Select ${profile.name} profile`}
    >
      {/* Icon */}
      <div
        className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.color} text-4xl text-white shadow-lg transition-transform group-hover:scale-110`}
      >
        {profile.icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 font-display text-xl font-bold text-gray-900">
        {profile.name}
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-600">{profile.description}</p>

      {/* Needs */}
      <div className="mt-auto space-y-2">
        <p className="text-xs font-semibold text-gray-500">Key Features:</p>
        <ul className="space-y-1 text-xs text-gray-600">
          {profile.needs.slice(0, 3).map((need, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 text-primary-500">•</span>
              <span>{need}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

