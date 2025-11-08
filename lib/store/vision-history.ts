/**
 * Vision History Store (Zustand)
 * Manages history of vision scans and favorites
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VisionScan {
  id: string;
  image: string; // Base64 or URL
  type: 'description' | 'ocr' | 'color' | 'object';
  scenario?: 'medicine' | 'sign' | 'menu' | 'document' | 'object' | 'color' | 'general';
  result: string;
  timestamp: Date;
  isFavorite: boolean;
  context?: string;
}

interface VisionHistoryState {
  scans: VisionScan[];
  addScan: (scan: Omit<VisionScan, 'id' | 'timestamp'>) => void;
  removeScan: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  getFavorites: () => VisionScan[];
  getRecentScans: (limit?: number) => VisionScan[];
}

export const useVisionHistory = create<VisionHistoryState>()(
  persist(
    (set, get) => ({
      scans: [],
      addScan: (scan) => {
        const newScan: VisionScan = {
          ...scan,
          id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          scans: [newScan, ...state.scans].slice(0, 100), // Keep last 100 scans
        }));
      },
      removeScan: (id) => {
        set((state) => ({
          scans: state.scans.filter((scan) => scan.id !== id),
        }));
      },
      toggleFavorite: (id) => {
        set((state) => ({
          scans: state.scans.map((scan) =>
            scan.id === id ? { ...scan, isFavorite: !scan.isFavorite } : scan
          ),
        }));
      },
      clearHistory: () => {
        set({ scans: [] });
      },
      getFavorites: () => {
        return get().scans.filter((scan) => scan.isFavorite);
      },
      getRecentScans: (limit = 10) => {
        return get().scans.slice(0, limit);
      },
    }),
    {
      name: 'inclusiaid-vision-history',
    }
  )
);

