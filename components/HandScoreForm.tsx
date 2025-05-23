
import React, { useState } from 'react';

interface HandScoreFormProps {
  onSubmit: (player1Score: number, player2Score: number) => void;
  player1Name: string;
  player2Name: string;
}

const HandScoreForm: React.FC<HandScoreFormProps> = ({ onSubmit, player1Name, player2Name }) => {
  const [pointsStr, setPointsStr] = useState<string>('');
  const [scoringPlayer, setScoringPlayer] = useState<'player1' | 'player2' | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(pointsStr, 10);

    if (scoringPlayer === '') {
      alert('Please select which player scored this hand.');
      return;
    }

    if (isNaN(points) || points < 0) { // Allow 0 points for a "wash" hand where selected player scores 0.
      alert('Please enter a valid non-negative number for points.');
      return;
    }
    
    let p1Score = 0;
    let p2Score = 0;

    if (scoringPlayer === 'player1') {
      p1Score = points;
    } else if (scoringPlayer === 'player2') {
      p2Score = points;
    }

    onSubmit(p1Score, p2Score);
    setPointsStr('');
    setScoringPlayer(''); // Reset for next hand
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-6 bg-slate-50 rounded-lg shadow" aria-labelledby="form-title">
      <h3 id="form-title" className="text-xl font-semibold text-slate-700 mb-6 text-center">Enter Hand Score</h3>
      
      <fieldset className="mb-6">
        <legend className="block text-sm font-medium text-slate-600 mb-2">Who scored this hand?</legend>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <input
              id="player1scorer"
              name="scoringPlayer"
              type="radio"
              value="player1"
              checked={scoringPlayer === 'player1'}
              onChange={() => setScoringPlayer('player1')}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"
            />
            <label htmlFor="player1scorer" className="ml-2 block text-sm text-slate-700">
              {player1Name}
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="player2scorer"
              name="scoringPlayer"
              type="radio"
              value="player2"
              checked={scoringPlayer === 'player2'}
              onChange={() => setScoringPlayer('player2')}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"
            />
            <label htmlFor="player2scorer" className="ml-2 block text-sm text-slate-700">
              {player2Name}
            </label>
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="pointsScored" className="block text-sm font-medium text-slate-600 mb-1">
          Points Scored by Selected Player
        </label>
        <input
          type="number"
          id="pointsScored"
          value={pointsStr}
          onChange={(e) => setPointsStr(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter points"
          min="0" 
          required={scoringPlayer !== ''} // Required if a player is selected
          aria-label="Points scored by selected player"
        />
      </div>

      <button
        type="submit"
        className="w-full mt-6 bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        disabled={scoringPlayer === ''}
      >
        Add Hand Score
      </button>
    </form>
  );
};

export default HandScoreForm;
