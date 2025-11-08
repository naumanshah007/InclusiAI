'use client';

import { useState } from 'react';
import { useEmergencyContactsStore, type EmergencyContact } from '@/lib/store/emergency-contacts-store';

export function EmergencyContactsSection() {
  const { contacts, addContact, removeContact, updateContact } = useEmergencyContactsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false,
  });

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter at least a name and phone number.');
      return;
    }

    addContact({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      relationship: formData.relationship.trim() || undefined,
      isPrimary: formData.isPrimary,
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      isPrimary: false,
    });
    setIsAdding(false);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      relationship: contact.relationship || '',
      isPrimary: contact.isPrimary || false,
    });
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter at least a name and phone number.');
      return;
    }

    updateContact(editingId, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      relationship: formData.relationship.trim() || undefined,
      isPrimary: formData.isPrimary,
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      isPrimary: false,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      isPrimary: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      removeContact(id);
    }
  };

  const handleSetPrimary = (id: string) => {
    updateContact(id, { isPrimary: true });
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Emergency Contacts
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Add trusted contacts who can be called in emergencies
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-lg bg-emergency-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emergency-700"
          >
            + Add Contact
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="mb-6 rounded-lg border-2 border-emergency-200 bg-emergency-50 p-4">
          <h3 className="mb-4 font-semibold text-emergency-900">
            {editingId ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contact name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emergency-500 focus:outline-none focus:ring-2 focus:ring-emergency-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emergency-500 focus:outline-none focus:ring-2 focus:ring-emergency-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emergency-500 focus:outline-none focus:ring-2 focus:ring-emergency-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Relationship (Optional)
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emergency-500 focus:outline-none focus:ring-2 focus:ring-emergency-500"
              >
                <option value="">Select relationship</option>
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="caregiver">Caregiver</option>
                <option value="doctor">Doctor</option>
                <option value="neighbor">Neighbor</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-emergency-600 focus:ring-2 focus:ring-emergency-500"
              />
              <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                Set as primary emergency contact
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 rounded-lg bg-emergency-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emergency-700"
              >
                {editingId ? 'Update Contact' : 'Add Contact'}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      {contacts.length === 0 && !isAdding && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No emergency contacts added yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            Click "Add Contact" to add your first emergency contact.
          </p>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-lg border-2 p-4 ${
                contact.isPrimary
                  ? 'border-emergency-500 bg-emergency-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    {contact.isPrimary && (
                      <span className="rounded-full bg-emergency-600 px-2 py-1 text-xs font-medium text-white">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <span>📞</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-emergency-600 hover:text-emergency-700 hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </p>
                    {contact.email && (
                      <p className="flex items-center gap-2">
                        <span>✉️</span>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-emergency-600 hover:text-emergency-700 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </p>
                    )}
                    {contact.relationship && (
                      <p className="flex items-center gap-2">
                        <span>👤</span>
                        <span className="capitalize">{contact.relationship}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {!contact.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(contact.id)}
                      className="rounded-lg bg-emergency-100 px-3 py-1 text-xs font-medium text-emergency-700 transition-colors hover:bg-emergency-200"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(contact)}
                    className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Your primary emergency contact will be called first when you use the emergency button or features.
        </p>
      </div>
    </section>
  );
}

