
import React from 'react';
import { GameSettings, GameStats, HandResult } from '../types';
import Scoreboard from '../components/Scoreboard';
import HandScoreForm from '../components/HandScoreForm';

interface ActiveGamePageProps {
  settings: GameSettings;
  stats: GameStats;
  hands: HandResult[];
  targetScore: number;
  handWinBonus: number;
  onAddHand: (player1Score: number, player2Score: number) => void;
  onAbandonGame: () => void;
  isGameActive: boolean; // To control rendering of HandScoreForm and Abandon button visibility
}

const ActiveGamePage: React.FC<ActiveGamePageProps> = ({
  settings,
  stats,
  hands,
  targetScore,
  handWinBonus,
  onAddHand,
  onAbandonGame,
  isGameActive,
}) => {
  return (
    <>
      <Scoreboard
        settings={settings}
        stats={stats}
        hands={hands}
        targetScore={targetScore}
        handWinBonus={handWinBonus}
      />
      {isGameActive && (
        <HandScoreForm 
          onSubmit={onAddHand} 
          player1Name={settings.player1Name} 
          player2Name={settings.player2Name} 
        />
      )}
      {isGameActive && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onAbandonGame}
            className="bg-orange-500 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-150 ease-in-out"
            aria-label="Abandon current game and return to home screen"
          >
            Abandon Game & Go Home
          </button>
        </div>
      )}
    </>
  );
};

export default ActiveGamePage;