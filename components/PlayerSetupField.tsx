import React from 'react';
import { User } from '../types';

interface PlayerSetupFieldProps {
  label: string;
  selectId: string;
  selectedUserId: string | null;
  onUserSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  users: User[];
  otherSelectedUserId: string | null;
  isCreatingNew: boolean;
  newUserName: string;
  onNewUserNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  newUserNamePlaceholder: string;
  onNewUserNameFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
  onNewUserNameBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  CREATE_NEW_USER_ID: string;
}

const PlayerSetupField: React.FC<PlayerSetupFieldProps> = ({
  label,
  selectId,
  selectedUserId,
  onUserSelect,
  users,
  otherSelectedUserId,
  isCreatingNew,
  newUserName,
  onNewUserNameChange,
  newUserNamePlaceholder,
  onNewUserNameFocus,
  onNewUserNameBlur,
  CREATE_NEW_USER_ID,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-600">{label}</label>
      <select
        id={selectId}
        value={selectedUserId || ''}
        onChange={onUserSelect}
        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        aria-label={`Select or create ${label}`}
      >
        <option value="" disabled>{`Select ${label} or Create New`}</option>
        {users.map(user => (
          <option 
            key={user.id} 
            value={user.id} 
            disabled={user.id === otherSelectedUserId && otherSelectedUserId !== CREATE_NEW_USER_ID}
          >
            {user.name}
          </option>
        ))}
        <option value={CREATE_NEW_USER_ID}>Create New User...</option>
      </select>
      {isCreatingNew && (
        <input
          type="text"
          placeholder={newUserNamePlaceholder}
          value={newUserName}
          onChange={onNewUserNameChange}
          onFocus={onNewUserNameFocus}
          onBlur={onNewUserNameBlur}
          className="w-full mt-2 p-3 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          aria-label={`New ${label} Name`}
        />
      )}
    </div>
  );
};

export default PlayerSetupField;