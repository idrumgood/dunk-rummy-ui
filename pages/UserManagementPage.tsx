
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import UserComparison from '../components/UserComparison'; // Path from pages/ to components/

interface UserManagementPageProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onBack: () => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ users, onUpdateUser, onDeleteUser, onBack }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [comparisonUserId, setComparisonUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string>(''); 

  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setComparisonUserId(null); 
    setIsEditing(false);
    setError('');
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingName(user.name);
    }
  };

  const handleComparisonUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setComparisonUserId(userId === '' ? null : userId);
  };
  
  const handleClearComparison = () => {
    setComparisonUserId(null);
  };

  const handleEditName = () => {
    if (selectedUser) {
      setEditingName(selectedUser.name);
      setIsEditing(true);
      setError('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    if (selectedUser) {
      setEditingName(selectedUser.name);
    }
  };

  const handleSaveName = () => {
    if (!selectedUser) return;
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setError('User name cannot be empty.');
      return;
    }
    if (users.some(u => u.id !== selectedUser.id && u.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`A user named "${trimmedName}" already exists. Please choose a different name.`);
      return;
    }

    onUpdateUser({ ...selectedUser, name: trimmedName });
    setIsEditing(false);
    setError('');
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      if (window.confirm(`Are you sure you want to delete ${selectedUser.name}? This action cannot be undone. Their past game records will remain, but this user profile will be removed.`)) {
        onDeleteUser(selectedUser.id);
        setSelectedUserId(null);
        setComparisonUserId(null); 
        setIsEditing(false);
        setError('');
      }
    }
  };

  const calculateOverallWinRate = (user: User | null): string => {
    if (!user) return 'N/A';
    const gamesPlayed = user.gamesPlayedIds.length;
    if (gamesPlayed === 0) return 'N/A (0 games)';
    const winRate = (user.gamesWon / gamesPlayed) * 100;
    return `${winRate.toFixed(1)}%`;
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-700">Manage Users</h2>
        <button
          onClick={onBack}
          className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
          aria-label="Return to home screen"
        >
          Back to Home
        </button>
      </div>

      {users.length === 0 ? (
        <p className="text-slate-600 text-center py-8">No users found. Users are created when starting a new game.</p>
      ) : (
        <div className="md:flex md:space-x-6">
          {/* User List */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Users</h3>
            <ul className="bg-white shadow rounded-lg border border-slate-200 divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {users.map(user => (
                <li key={user.id}>
                  <button
                    onClick={() => handleSelectUser(user.id)}
                    className={`w-full text-left p-3 hover:bg-slate-100 focus:outline-none focus:bg-slate-100 transition-colors ${selectedUserId === user.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-700'}`}
                    aria-pressed={selectedUserId === user.id}
                  >
                    {user.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* User Details and Actions */}
          <div className="md:w-2/3">
            {selectedUser ? (
              <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  {isEditing ? (
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xl font-semibold"
                        aria-label="Edit user name"
                      />
                    </div>
                  ) : (
                    <h3 className="text-2xl font-semibold text-slate-800" id="selected-user-name">{selectedUser.name}</h3>
                  )}
                  
                  <div className="ml-4 flex-shrink-0">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveName}
                          className="text-sm bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-md shadow-sm transition"
                          aria-label="Save name change"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-sm bg-slate-400 hover:bg-slate-500 text-white font-medium py-1 px-3 rounded-md shadow-sm transition"
                          aria-label="Cancel name change"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleEditName}
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md shadow-sm transition"
                        aria-label={`Edit name for ${selectedUser.name}`}
                      >
                        Edit Name
                      </button>
                    )}
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 my-2 bg-red-100 p-2 rounded-md">{error}</p>}
                
                <div className="space-y-2 text-slate-600 mb-6">
                  <p><strong>Overall Games Played:</strong> {selectedUser.gamesPlayedIds.length}</p>
                  <p><strong>Overall Games Won:</strong> {selectedUser.gamesWon}</p>
                  <p><strong>Overall Games Lost:</strong> {selectedUser.gamesLost}</p>
                  <p><strong>Overall Win Rate:</strong> {calculateOverallWinRate(selectedUser)}</p>
                </div>

                <UserComparison
                  selectedUser={selectedUser}
                  comparisonUserId={comparisonUserId}
                  allUsers={users}
                  onComparisonUserSelect={handleComparisonUserSelect}
                  onClearComparison={handleClearComparison}
                />

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleDeleteUser}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label={`Delete user ${selectedUser.name}`}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg border border-slate-200 p-6 text-center">
                <p className="text-slate-500">Select a user from the list to view their details and manage them.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;