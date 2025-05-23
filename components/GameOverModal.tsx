
import React from 'react';
import { FinalGameResult } from '../types';

interface GameOverModalProps {
  result: FinalGameResult;
  onClose: () => void; 
  aiGameSummary: string | null; // New prop for AI summary
}

const GameOverModal: React.FC<GameOverModalProps> = ({ result, onClose, aiGameSummary }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="gameOverTitle">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
        <h2 id="gameOverTitle" className="text-3xl font-bold text-center text-slate-800 mb-6">
          Game Over!
        </h2>
        
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
          <p className="text-xl font-semibold text-yellow-700 text-center">
            Winner: <span className="text-yellow-800">{result.winnerName}</span>
          </p>
        </div>

        <div className="space-y-4 mb-6"> {/* Adjusted mb-6 from mb-8 to make space for AI summary */}
          <div className="p-4 border border-slate-200 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-700">{result.player1Name}</h4>
            <p className="text-sm text-slate-600">
              Cumulative Score: <span className="font-medium">{result.player1Cumulative}</span>
            </p>
            <p className="text-sm text-slate-600">
              Hands Won: <span className="font-medium">{result.player1HandsWon}</span> (Bonus: <span className="font-medium">{result.player1HandsWon * result.handWinBonus}</span>)
            </p>
            <p className="text-xl font-bold text-blue-600 mt-1">
              Final Score: {result.player1FinalScore}
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg">
            <h4 className="text-lg font-semibold text-green-700">{result.player2Name}</h4>
            <p className="text-sm text-slate-600">
              Cumulative Score: <span className="font-medium">{result.player2Cumulative}</span>
            </p>
            <p className="text-sm text-slate-600">
              Hands Won: <span className="font-medium">{result.player2HandsWon}</span> (Bonus: <span className="font-medium">{result.player2HandsWon * result.handWinBonus}</span>)
            </p>
            <p className="text-xl font-bold text-green-600 mt-1">
              Final Score: {result.player2FinalScore}
            </p>
          </div>
        </div>

        {/* AI Game Summary Section */}
        {aiGameSummary !== null && (
          <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-md">
            <h4 className="text-md font-semibold text-purple-800 mb-2">AI Game Summary:</h4>
            <p className="text-sm text-purple-700 whitespace-pre-wrap" aria-live="polite">
              {aiGameSummary === 'Generating AI summary...' ? (
                <span className="italic">Generating... please wait.</span>
              ) : (
                aiGameSummary
              )}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Return to home screen"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;