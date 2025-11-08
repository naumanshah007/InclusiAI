/**
 * Authentication Store (Zustand)
 * Handles user authentication and session management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserProfileType } from '@/lib/types/user-profiles';

export interface User {
  id: string;
  email: string;
  name: string;
  profileId?: UserProfileType | null;
  role?: 'user' | 'admin';
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Simple in-memory user storage (for demo - in production, use a backend)
const users: Map<string, { password: string; user: User }> = new Map();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simple authentication (in production, use proper backend)
        const userData = users.get(email);
        if (userData && userData.password === password) {
          set({ user: userData.user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      signup: async (email: string, password: string, name: string) => {
        // Check if user already exists
        if (users.has(email)) {
          return false;
        }

        // Create new user
        const newUser: User = {
          id: `user_${Date.now()}`,
          email,
          name,
          profileId: null, // Will be set during profile selection
          role: 'user', // Default to user, can be set to 'admin' manually
          createdAt: new Date(),
        };

        // Store user (in production, use proper backend with hashed passwords)
        users.set(email, { password, user: newUser });

        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'inclusiaid-auth',
    }
  )
);

