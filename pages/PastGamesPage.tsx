
import React, { useEffect, useState } from 'react';
import { StoredGame } from '../types'; 
import { getPastGamesAPI } from '../utils/storage'; 
import { formatDisplayDate } from '../utils/formatters';

interface PastGamesPageProps {
  onBack: () => void;
}

const PastGamesPage: React.FC<PastGamesPageProps> = ({ onBack }) => {
  const [pastGames, setPastGames] = useState<StoredGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPastGames = async () => {
      setIsLoading(true);
      try {
        const games = await getPastGamesAPI();
        setPastGames(games);
      } catch (error) {
        console.error("Failed to load past games:", error);
        // Optionally, set an error state to display to the user
      } finally {
        setIsLoading(false);
      }
    };
    fetchPastGames();
  }, []);


  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-700">Past Games</h2>
        <button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
            aria-label="Return to home screen"
        >
            Back to Home
        </button>
      </div>

      {isLoading ? (
        <p className="text-slate-600 text-center py-8">Loading past games...</p>
      ) : pastGames.length === 0 ? (
        <p className="text-slate-600 text-center py-8">No past games recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {pastGames.map((game) => (
            <div key={game.id} className="bg-slate-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="text-sm text-slate-500 mb-1">
                Played on: {formatDisplayDate(game.date)}
              </p>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Winner: <span className={game.finalResult.winnerName === "It's a Tie!" ? "text-orange-600" : "text-green-600"}>{game.finalResult.winnerName}</span>
              </h3>
              <p className="text-md text-slate-700">
                <span className="font-medium">{game.settings.player1Name}:</span> {game.finalResult.player1FinalScore} points
              </p>
              <p className="text-md text-slate-700">
                <span className="font-medium">{game.settings.player2Name}:</span> {game.finalResult.player2FinalScore} points
              </p>
              {game.aiSummary && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-purple-700 mb-1">AI Game Summary:</h4>
                  <p className="text-sm text-slate-600 italic whitespace-pre-wrap">{game.aiSummary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastGamesPage;