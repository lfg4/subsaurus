'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/shared/Modal';

interface User {
  slackUserId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  onAddUsers: (userIds: string[]) => Promise<void>;
}

export function AddUsersModal({ isOpen, onClose, availableUsers, onAddUsers }: AddUsersModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchTerm('');
    onClose();
  };

  const handleAdd = async () => {
    if (selectedUsers.length === 0) {
      alert('⚠️ Select at least one user');
      return;
    }

    setIsAdding(true);
    try {
      await onAddUsers(selectedUsers);
      handleClose();
    } catch (error) {
      console.error('Error adding users:', error);
      alert('❌ Error adding users');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredUsers = availableUsers.filter(user => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <Modal onClose={handleClose}>
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <span>👥</span> Add users
        </h3>

        {availableUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">✅</div>
            <p className="text-gray-600 font-semibold">All users are already assigned to this subscription</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-semibold">
                  No users found matching "{searchTerm}"
                </div>
              ) : (
                filteredUsers.map(user => (
                  <label
                    key={user.slackUserId}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg cursor-pointer transition border-2 border-transparent hover:border-green-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.slackUserId)}
                      onChange={() => toggleUserSelection(user.slackUserId)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName || user.email}
                        className="w-10 h-10 rounded-full shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{user.displayName || user.email}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={selectedUsers.length === 0 || isAdding}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition font-bold shadow-lg border-2 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? '⏳ Adding...' : `Add ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}