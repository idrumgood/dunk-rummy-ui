import React, { useState } from 'react';
import { User } from '../types';
import { PlayerSelectionData } from '../App'; // Path should be correct from pages/ to root App.tsx
import PlayerSetupField from '../components/PlayerSetupField'; // Import the new component

export const CREATE_NEW_USER_ID = 'CREATE_NEW_USER'; 

interface GameSettingsPageProps {
  users: User[];
  onStartGame: (p1Data: PlayerSelectionData, p2Data: PlayerSelectionData) => void;
  onBack: () => void;
}

const GameSettingsPage: React.FC<GameSettingsPageProps> = ({ 
    users, 
    onStartGame, 
    onBack,
}) => {
  const [selectedPlayer1Id, setSelectedPlayer1Id] = useState<string | null>(null);
  const [newPlayer1Name, setNewPlayer1Name] = useState<string>('');
  const [selectedPlayer2Id, setSelectedPlayer2Id] = useState<string | null>(null);
  const [newPlayer2Name, setNewPlayer2Name] = useState<string>('');
  const [error, setError] = useState<string>('');

  const placeholderP1Name = "New Player 1 Name";
  const placeholderP2Name = "New Player 2 Name";

  const handlePlayerSelect = (
    setter: React.Dispatch<React.SetStateAction<string | null>>, 
    otherPlayerId: string | null,
    otherPlayerSetter: React.Dispatch<React.SetStateAction<string | null>>,
    newNameSetter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setter(value);
    if (value !== CREATE_NEW_USER_ID) {
      newNameSetter(''); 
    }
    if (value && value !== CREATE_NEW_USER_ID && value === otherPlayerId) {
        otherPlayerSetter(null); // Deselect the other player if they are now the same
    }
    setError('');
  };

  const handleNewNameChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError('');
  };
  
  // Simplified focus/blur handlers, actual placeholder logic is handled by input's placeholder prop
  const handleNewNameFocus = () => {};
  const handleNewNameBlur = () => {};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let p1Data: PlayerSelectionData;
    let p2Data: PlayerSelectionData;

    const p1TrimmedName = newPlayer1Name.trim();
    const p2TrimmedName = newPlayer2Name.trim();

    // Validate and prepare Player 1
    if (selectedPlayer1Id === CREATE_NEW_USER_ID) {
      if (!p1TrimmedName || p1TrimmedName === placeholderP1Name) {
        setError('Player 1: New user name cannot be empty.');
        return;
      }
      if (users.some(u => u.name.toLowerCase() === p1TrimmedName.toLowerCase())) {
        setError(`Player 1: A user named "${p1TrimmedName}" already exists. Please choose a different name or select the existing user.`);
        return;
      }
      p1Data = { id: CREATE_NEW_USER_ID, name: p1TrimmedName };
    } else if (selectedPlayer1Id) {
      p1Data = { id: selectedPlayer1Id };
    } else {
      setError('Please select or create Player 1.');
      return;
    }

    // Validate and prepare Player 2
    if (selectedPlayer2Id === CREATE_NEW_USER_ID) {
      if (!p2TrimmedName || p2TrimmedName === placeholderP2Name) {
        setError('Player 2: New user name cannot be empty.');
        return;
      }
      const p1IsNewAndMatchesP2 = selectedPlayer1Id === CREATE_NEW_USER_ID && p1TrimmedName.toLowerCase() === p2TrimmedName.toLowerCase();
      if (users.some(u => u.name.toLowerCase() === p2TrimmedName.toLowerCase()) || p1IsNewAndMatchesP2) {
        setError(`Player 2: A user named "${p2TrimmedName}" already exists or matches Player 1's new name. Please choose a different name or select the existing user.`);
        return;
      }
      p2Data = { id: CREATE_NEW_USER_ID, name: p2TrimmedName };
    } else if (selectedPlayer2Id) {
      p2Data = { id: selectedPlayer2Id };
    } else {
      setError('Please select or create Player 2.');
      return;
    }
    
    if (p1Data.id && p1Data.id !== CREATE_NEW_USER_ID && 
        p2Data.id && p2Data.id !== CREATE_NEW_USER_ID && 
        p1Data.id === p2Data.id) {
      setError('Players must be different. Please select two different users.');
      return;
    }

    onStartGame(p1Data, p2Data);
  };

  return (
    <div className="p-6 bg-slate-50 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center">Game Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <PlayerSetupField
          label="Player 1"
          selectId="player1Select"
          selectedUserId={selectedPlayer1Id}
          onUserSelect={handlePlayerSelect(setSelectedPlayer1Id, selectedPlayer2Id, setSelectedPlayer2Id, setNewPlayer1Name)}
          users={users}
          otherSelectedUserId={selectedPlayer2Id}
          isCreatingNew={selectedPlayer1Id === CREATE_NEW_USER_ID}
          newUserName={newPlayer1Name}
          onNewUserNameChange={handleNewNameChange(setNewPlayer1Name)}
          newUserNamePlaceholder={placeholderP1Name}
          onNewUserNameFocus={handleNewNameFocus}
          onNewUserNameBlur={handleNewNameBlur}
          CREATE_NEW_USER_ID={CREATE_NEW_USER_ID}
        />

        <PlayerSetupField
          label="Player 2"
          selectId="player2Select"
          selectedUserId={selectedPlayer2Id}
          onUserSelect={handlePlayerSelect(setSelectedPlayer2Id, selectedPlayer1Id, setSelectedPlayer1Id, setNewPlayer2Name)}
          users={users}
          otherSelectedUserId={selectedPlayer1Id}
          isCreatingNew={selectedPlayer2Id === CREATE_NEW_USER_ID}
          newUserName={newPlayer2Name}
          onNewUserNameChange={handleNewNameChange(setNewPlayer2Name)}
          newUserNamePlaceholder={placeholderP2Name}
          onNewUserNameFocus={handleNewNameFocus}
          onNewUserNameBlur={handleNewNameBlur}
          CREATE_NEW_USER_ID={CREATE_NEW_USER_ID}
        />
        
        {error && <p className="text-sm text-red-600 text-center bg-red-100 p-2 rounded-md">{error}</p>}

        <p className="text-sm text-slate-500 text-center">
          Select existing players or create new ones. Game ends at 100 points. 20 bonus points per hand won.
        </p>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Start game with selected players"
        >
          Start Game
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full mt-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50"
          aria-label="Go back to home screen"
        >
          Back to Home
        </button>
      </form>
    </div>
  );
};

export default GameSettingsPage;