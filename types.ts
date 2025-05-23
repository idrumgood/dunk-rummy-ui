
export interface User {
  id: string;
  name: string;
  gamesPlayedIds: string[];
  gamesWon: number;
  gamesLost: number;
  // Consider gamesTied in the future if desired
}

export interface GameSettings {
  player1Id: string | null;
  player2Id: string | null;
  player1Name: string; // Name of player 1 for the current game, derived from User
  player2Name: string; // Name of player 2 for the current game, derived from User
}

export enum HandWinner {
  Player1 = 'Player1',
  Player2 = 'Player2',
  Tie = 'Tie', // Tie can occur if 0 points are scored in a hand
}

export interface HandResult {
  id: string;
  player1Score: number;
  player2Score: number;
  winner: HandWinner | null;
}

export interface GameStats {
  player1CumulativeScore: number;
  player2CumulativeScore: number;
  player1HandsWon: number;
  player2HandsWon: number;
}

export interface FinalGameResult {
  player1FinalScore: number;
  player2FinalScore: number;
  winnerName: string; // Can be a User's name or "It's a Tie!"
  winnerId?: string | null; // ID of the winning user, if not a tie
  player1Name: string;
  player2Name: string;
  player1Id: string | null;
  player2Id: string | null;
  player1Cumulative: number;
  player2Cumulative: number;
  player1HandsWon: number;
  player2HandsWon: number;
  handWinBonus: number;
}

export interface StoredGame {
  id: string; // Unique ID for the stored game, e.g., timestamp
  date: string; // ISO string date of game completion
  settings: GameSettings; // Will now include player IDs and names for that game instance
  hands: HandResult[];
  finalResult: FinalGameResult;
  aiSummary?: string | null; // AI-generated summary of the game
}

export interface HeadToHeadStats {
  gamesPlayed: number;
  selectedUserWins: number;
  comparisonUserWins: number;
  ties: number;
  selectedUserShutouts: number;
  comparisonUserShutouts: number;
}
