'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface RecentAction {
  id: string;
  label: string;
  route: string;
  timestamp: Date;
}

export function RecentActions() {
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);

  useEffect(() => {
    // Load recent actions from localStorage
    const stored = localStorage.getItem('inclusiaid-recent-actions');
    if (stored) {
      try {
        const actions = JSON.parse(stored).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
        setRecentActions(actions.slice(0, 6)); // Show last 6
      } catch (e) {
        console.error('Error loading recent actions:', e);
      }
    }
  }, []);

  if (recentActions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-2xl font-semibold text-gray-900">
        Recent Actions
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {recentActions.map((action) => (
          <Link
            key={action.id}
            href={action.route}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:scale-105 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{action.label}</h3>
              <p className="text-xs text-gray-500">
                {action.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

