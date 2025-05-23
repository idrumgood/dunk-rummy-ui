
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, StoredGame, HeadToHeadStats } from '../types';
import { getPastGamesAPI } from '../utils/storage';
import { renderHeadToHeadPieChart, destroyChart } from '../utils/chartUtils';
import type { Chart as ChartJSChart } from 'chart.js';

interface UserComparisonProps {
  selectedUser: User | null;
  comparisonUserId: string | null;
  allUsers: User[];
  onComparisonUserSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClearComparison: () => void;
}

const UserComparison: React.FC<UserComparisonProps> = ({
  selectedUser,
  comparisonUserId,
  allUsers,
  onComparisonUserSelect,
  onClearComparison,
}) => {
  const [headToHeadStats, setHeadToHeadStats] = useState<HeadToHeadStats | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const chartRef = useRef<ChartJSChart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const comparisonUser = useMemo(() => {
    if (!comparisonUserId) return null;
    return allUsers.find(u => u.id === comparisonUserId) || null;
  }, [allUsers, comparisonUserId]);

  useEffect(() => {
    if (selectedUser && comparisonUser) {
      const fetchAndCalcHeadToHead = async () => {
        setIsLoadingComparison(true);
        setHeadToHeadStats(null);
        setComparisonError(null);
        try {
          const allGames: StoredGame[] = await getPastGamesAPI();
          let played = 0;
          let sUserWins = 0;
          let cUserWins = 0;
          let gameTies = 0;
          let sUserShutouts = 0;
          let cUserShutouts = 0;

          allGames.forEach(game => {
            const p1IsSelected = game.settings.player1Id === selectedUser.id;
            const p2IsSelected = game.settings.player2Id === selectedUser.id;
            const p1IsComparison = game.settings.player1Id === comparisonUser.id;
            const p2IsComparison = game.settings.player2Id === comparisonUser.id;

            if ((p1IsSelected && p2IsComparison) || (p1IsComparison && p2IsSelected)) {
              played++;
              const selectedUserWasP1 = p1IsSelected;

              if (game.finalResult.winnerId === selectedUser.id) {
                sUserWins++;
                if (selectedUserWasP1 && game.finalResult.player2Cumulative === 0) {
                  sUserShutouts++;
                } else if (!selectedUserWasP1 && game.finalResult.player1Cumulative === 0) {
                  sUserShutouts++;
                }
              } else if (game.finalResult.winnerId === comparisonUser.id) {
                cUserWins++;
                 if (selectedUserWasP1 && game.finalResult.player1Cumulative === 0) { // comparison was P2 and lost with 0
                  cUserShutouts++;
                } else if (!selectedUserWasP1 && game.finalResult.player2Cumulative === 0) { // comparison was P1 and lost with 0
                  cUserShutouts++;
                }
              } else if (game.finalResult.winnerName === "It's a Tie!") {
                gameTies++;
              }
            }
          });
          setHeadToHeadStats({
            gamesPlayed: played,
            selectedUserWins: sUserWins,
            comparisonUserWins: cUserWins,
            ties: gameTies,
            selectedUserShutouts: sUserShutouts,
            comparisonUserShutouts: cUserShutouts,
          });
        } catch (err) {
          console.error("Failed to load games for comparison:", err);
          setComparisonError("Could not load comparison data. Please try again.");
          setHeadToHeadStats(null);
        } finally {
          setIsLoadingComparison(false);
        }
      };
      fetchAndCalcHeadToHead();
    } else {
      setHeadToHeadStats(null);
      setIsLoadingComparison(false);
      setComparisonError(null);
    }
  }, [selectedUser, comparisonUser]);

  useEffect(() => {
    if (selectedUser && comparisonUser && headToHeadStats && headToHeadStats.gamesPlayed > 0 && canvasRef.current) {
      chartRef.current = renderHeadToHeadPieChart(canvasRef.current, chartRef.current, selectedUser, comparisonUser, headToHeadStats);
    } else {
      destroyChart(chartRef.current);
      chartRef.current = null;
    }
    // Cleanup on component unmount or when dependencies change leading to no chart
    return () => {
      destroyChart(chartRef.current);
      chartRef.current = null;
    };
  }, [selectedUser, comparisonUser, headToHeadStats]);


  const calculateHeadToHeadWinPercentage = (wins: number, totalH2HGamesExcludingTies: number): string => {
    if (totalH2HGamesExcludingTies === 0) return 'N/A';
    const winRate = (wins / totalH2HGamesExcludingTies) * 100;
    return `${winRate.toFixed(1)}%`;
  };

  const availableForComparison = allUsers.filter(u => u.id !== selectedUser?.id);

  if (!selectedUser) return null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <h4 className="text-xl font-semibold text-slate-700 mb-3">Head-to-Head Comparison</h4>
      {availableForComparison.length > 0 ? (
        <div className="mb-4">
          <label htmlFor="comparisonUserSelect" className="block text-sm font-medium text-slate-600 mb-1">Compare with:</label>
          <select
            id="comparisonUserSelect"
            value={comparisonUserId || ''}
            onChange={onComparisonUserSelect}
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select user to compare with"
          >
            <option value="">Select a user</option>
            {availableForComparison.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No other users available for comparison.</p>
      )}

      {isLoadingComparison && <p className="text-slate-600 text-center py-4">Loading comparison data...</p>}
      
      {comparisonError && !isLoadingComparison && (
        <p className="text-red-600 text-center py-4 bg-red-50 rounded-md">
          {comparisonError}
        </p>
      )}

      {comparisonUser && !isLoadingComparison && headToHeadStats && (
        <>
          <button
            onClick={onClearComparison}
            className="mb-4 text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium py-1 px-3 rounded-md shadow-sm transition"
            aria-label={`Clear comparison with ${comparisonUser.name}`}
          >
            Clear Comparison with {comparisonUser.name}
          </button>
          
          <h5 className="text-lg font-medium text-slate-700 mb-2">
            {selectedUser.name} vs {comparisonUser.name}
          </h5>

          {headToHeadStats.gamesPlayed > 0 ? (
            <>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stat (Head-to-Head)</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{selectedUser.name}</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{comparisonUser.name}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700">Games Played</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 text-center" colSpan={2}>{headToHeadStats.gamesPlayed}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700">Wins</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{headToHeadStats.selectedUserWins}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{headToHeadStats.comparisonUserWins}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700">Losses</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{headToHeadStats.comparisonUserWins}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{headToHeadStats.selectedUserWins}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700">Shutouts</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{headToHeadStats.selectedUserShutouts}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{headToHeadStats.comparisonUserShutouts}</td>
                    </tr>
                      {headToHeadStats.ties > 0 && (
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700">Ties</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 text-center" colSpan={2}>{headToHeadStats.ties}</td>
                        </tr>
                      )}
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700">Win Rate (vs each other)</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{calculateHeadToHeadWinPercentage(headToHeadStats.selectedUserWins, headToHeadStats.gamesPlayed - headToHeadStats.ties)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{calculateHeadToHeadWinPercentage(headToHeadStats.comparisonUserWins, headToHeadStats.gamesPlayed - headToHeadStats.ties)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="relative h-72 md:h-96 w-full">
                <canvas ref={canvasRef} aria-label={`Pie chart showing head-to-head game outcomes between ${selectedUser.name} and ${comparisonUser.name}`}></canvas>
              </div>
            </>
          ) : (
            <p className="text-slate-600 text-center py-4 bg-slate-50 rounded-md">
              These two users have not played any games against each other.
            </p>
          )}
        </>
      )}
      {comparisonUser && !isLoadingComparison && !headToHeadStats && !comparisonError && (
        <p className="text-slate-600 text-center py-4 bg-slate-50 rounded-md">
            Select users to see comparison data.
        </p>
      )}
    </div>
  );
};

export default UserComparison;
