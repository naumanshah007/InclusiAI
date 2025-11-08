'use client';

import { useState } from 'react';
import { useAuthStore, type User } from '@/lib/store/auth-store';
import { USER_PROFILES, type UserProfileType } from '@/lib/types/user-profiles';
import { useAdminStore } from '@/lib/store/admin-store';

export function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const { users, refreshAnalytics } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Get all users from auth store (in production, this would come from backend)
  // For now, we'll show a message that this is a demo
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateUserRole = (userId: string, newRole: 'user' | 'admin') => {
    // In production, this would call an API
    console.log(`Update user ${userId} role to ${newRole}`);
    refreshAnalytics();
  };

  const handleUpdateUserProfile = (userId: string, newProfile: UserProfileType) => {
    // In production, this would call an API
    console.log(`Update user ${userId} profile to ${newProfile}`);
    refreshAnalytics();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-2xl font-bold text-gray-900">
          User Management
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Manage user accounts, roles, and profiles. In production, this would connect to a backend API.
        </p>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              In production, users would be loaded from a backend database.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const profile = user.profileId ? USER_PROFILES[user.profileId] : null;
              return (
                <div
                  key={user.userId}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        {profile && (
                          <div className="flex items-center gap-2">
                            <span>{profile.icon}</span>
                            <span className="text-gray-600">{profile.name}</span>
                          </div>
                        )}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.role || 'user'}
                        </span>
                        <span className="text-gray-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser({
                          id: user.userId,
                          email: user.email,
                          name: user.name,
                          profileId: user.profileId,
                          role: user.role,
                          createdAt: user.createdAt,
                        })}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="mb-4 font-display text-xl font-bold text-gray-900">
              Edit User: {selectedUser.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  defaultValue={selectedUser.role || 'user'}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => handleUpdateUserRole(selectedUser.id, e.target.value as 'user' | 'admin')}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profile
                </label>
                <select
                  defaultValue={selectedUser.profileId || 'general'}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => handleUpdateUserProfile(selectedUser.id, e.target.value as UserProfileType)}
                >
                  {Object.values(USER_PROFILES)
                    .filter((p) => p.id !== 'admin')
                    .map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In production, save changes via API
                    setSelectedUser(null);
                    refreshAnalytics();
                  }}
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

