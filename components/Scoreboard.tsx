
import React from 'react';
import { GameSettings, HandResult, GameStats, HandWinner } from '../types';

interface ScoreboardProps {
  settings: GameSettings; // Contains player1Id, player2Id, player1Name, player2Name
  stats: GameStats;
  hands: HandResult[];
  targetScore: number;
  handWinBonus: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ settings, stats, hands, targetScore, handWinBonus }) => {
  const getHandWinnerName = (winner: HandWinner | null) => {
    if (winner === HandWinner.Player1) return settings.player1Name;
    if (winner === HandWinner.Player2) return settings.player2Name;
    if (winner === HandWinner.Tie) return 'Tie (0 pts)';
    return '-';
  };
  
  return (
    <div className="space-y-6" aria-labelledby="scoreboard-title">
      {/* Current Scores Section */}
      <div className="p-6 bg-blue-50 rounded-lg shadow-md">
        <h3 id="scoreboard-title" className="text-xl font-semibold text-blue-700 mb-4 text-center">Current Game</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-lg font-semibold text-slate-700" aria-label={`${settings.player1Name} details`}>{settings.player1Name}</p>
            <p className="text-3xl font-bold text-blue-600" aria-live="polite" aria-atomic="true">{stats.player1CumulativeScore}</p>
            <p className="text-xs text-slate-500">Hands Won: {stats.player1HandsWon}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-lg font-semibold text-slate-700" aria-label={`${settings.player2Name} details`}>{settings.player2Name}</p>
            <p className="text-3xl font-bold text-blue-600" aria-live="polite" aria-atomic="true">{stats.player2CumulativeScore}</p>
            <p className="text-xs text-slate-500">Hands Won: {stats.player2HandsWon}</p>
          </div>
        </div>
        <div className="text-center text-sm text-slate-600">
          <p>Target Score: <span className="font-semibold">{targetScore}</span></p>
          <p>Bonus Per Hand Won: <span className="font-semibold">{handWinBonus}</span></p>
        </div>
      </div>

      {/* Hand History Section */}
      {hands.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow-md" aria-labelledby="hand-history-title">
          <h3 id="hand-history-title" className="text-xl font-semibold text-slate-700 mb-4 text-center">Hand History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hand</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{settings.player1Name}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{settings.player2Name}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hand Winner</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {hands.map((hand, index) => (
                  <tr key={hand.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{hand.player1Score}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{hand.player2Score}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                        hand.winner === HandWinner.Player1 ? 'text-green-600' :
                        hand.winner === HandWinner.Player2 ? 'text-green-600' :
                        hand.winner === HandWinner.Tie ? 'text-orange-500' : 
                        'text-slate-500'
                      }`}>
                      {getHandWinnerName(hand.winner)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
