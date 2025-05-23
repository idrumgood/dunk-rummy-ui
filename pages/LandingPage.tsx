
import React from 'react';

interface LandingPageProps {
  onStartNewGame: () => void;
  onViewPastGames: () => void;
  onManageUsers: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartNewGame, onViewPastGames, onManageUsers }) => {
  return (
    <div className="text-center p-6 md:p-8">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">Welcome to Gin Rummy Scorer!</h2>
      <div className="space-y-4">
        <button
          onClick={onStartNewGame}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg"
          aria-label="Start a new game of Gin Rummy"
        >
          Start New Game
        </button>
        <button
          onClick={onViewPastGames}
          className="w-full mt-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 text-lg"
          aria-label="View past Gin Rummy games"
        >
          View Past Games
        </button>
        <button
          onClick={onManageUsers}
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 text-lg"
          aria-label="Manage users"
        >
          Manage Users
        </button>
      </div>
    </div>
  );
};

export default LandingPage;