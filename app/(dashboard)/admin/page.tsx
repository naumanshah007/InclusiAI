'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { ProfileNavigation } from '@/components/navigation/ProfileNavigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { useState } from 'react';

type AdminTab = 'dashboard' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-30"
        role="banner"
      >
        <div className="container mx-auto px-4 py-4">
          <ProfileNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-primary-50/30 py-8" role="main">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Management
            </button>
          </div>

          {/* Content */}
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </main>
    </div>
  );
}

