/**
 * Admin Store (Zustand)
 * Manages admin-specific data and analytics
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfileType } from '@/lib/types/user-profiles';
import type { User } from '@/lib/store/auth-store';

export interface UserAnalytics {
  userId: string;
  email: string;
  name: string;
  profileId: UserProfileType | null;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  featureUsage: Record<string, number>; // Feature route -> usage count
  totalSessions: number;
}

export interface ProfileAnalytics {
  profileId: UserProfileType;
  userCount: number;
  totalUsage: number;
  mostUsedFeatures: Array<{ feature: string; count: number }>;
  averageSessions: number;
}

interface AdminState {
  users: UserAnalytics[];
  analytics: {
    totalUsers: number;
    activeUsers: number;
    profileDistribution: Record<UserProfileType, number>;
    featureUsage: Record<string, number>;
    profileAnalytics: ProfileAnalytics[];
  };
  refreshAnalytics: () => void;
  getUserAnalytics: (userId: string) => UserAnalytics | undefined;
  getProfileAnalytics: (profileId: UserProfileType) => ProfileAnalytics | undefined;
}

// Mock data storage (in production, this would come from a backend)
const mockUsers: UserAnalytics[] = [];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      analytics: {
        totalUsers: 0,
        activeUsers: 0,
        profileDistribution: {} as Record<UserProfileType, number>,
        featureUsage: {},
        profileAnalytics: [],
      },
      refreshAnalytics: () => {
        // In production, this would fetch from a backend
        // For now, we'll calculate from localStorage
        const users = get().users;
        
        // Calculate profile distribution
        const profileDistribution: Record<string, number> = {};
        users.forEach((user) => {
          const profile = user.profileId || 'general';
          profileDistribution[profile] = (profileDistribution[profile] || 0) + 1;
        });

        // Calculate feature usage
        const featureUsage: Record<string, number> = {};
        users.forEach((user) => {
          Object.entries(user.featureUsage).forEach(([feature, count]) => {
            featureUsage[feature] = (featureUsage[feature] || 0) + count;
          });
        });

        // Calculate profile analytics
        const profileAnalytics: ProfileAnalytics[] = [];
        Object.entries(profileDistribution).forEach(([profileId, userCount]) => {
          const profileUsers = users.filter((u) => (u.profileId || 'general') === profileId);
          const totalUsage = profileUsers.reduce((sum, u) => sum + Object.values(u.featureUsage).reduce((a, b) => a + b, 0), 0);
          const featureCounts: Record<string, number> = {};
          profileUsers.forEach((u) => {
            Object.entries(u.featureUsage).forEach(([feature, count]) => {
              featureCounts[feature] = (featureCounts[feature] || 0) + count;
            });
          });
          const mostUsedFeatures = Object.entries(featureCounts)
            .map(([feature, count]) => ({ feature, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          const averageSessions = profileUsers.length > 0
            ? profileUsers.reduce((sum, u) => sum + u.totalSessions, 0) / profileUsers.length
            : 0;

          profileAnalytics.push({
            profileId: profileId as UserProfileType,
            userCount,
            totalUsage,
            mostUsedFeatures,
            averageSessions,
          });
        });

        set({
          analytics: {
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.lastLogin && new Date(u.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
            profileDistribution: profileDistribution as Record<UserProfileType, number>,
            featureUsage,
            profileAnalytics,
          },
        });
      },
      getUserAnalytics: (userId: string) => {
        return get().users.find((u) => u.userId === userId);
      },
      getProfileAnalytics: (profileId: UserProfileType) => {
        return get().analytics.profileAnalytics.find((a) => a.profileId === profileId);
      },
    }),
    {
      name: 'inclusiaid-admin',
    }
  )
);

