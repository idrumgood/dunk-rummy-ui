
import React, { useState, useCallback, useEffect } from 'react';
import { GameSettings, HandResult, HandWinner, FinalGameResult, GameStats, StoredGame, User } from './types';
import { 
  getUsersAPI, 
  createUserAPI, 
  updateUserNameAPI, 
  deleteUserAPI, 
  getPastGamesAPI, 
  saveCompletedGameAPI 
} from './utils/storage';
// import { generateGameSummary } from './utils/aiHelper'; // Removed as AI summary is now from backend
import HandScoreForm from './components/HandScoreForm';
import Scoreboard from './components/Scoreboard';
import GameOverModal from './components/GameOverModal';
// Updated import paths for page components
import GameSettingsPage, { CREATE_NEW_USER_ID } from './pages/GameSettingsPage';
import LandingPage from './pages/LandingPage';
import PastGamesPage from './pages/PastGamesPage';
import UserManagementPage from './pages/UserManagementPage';
import ActiveGamePage from './pages/ActiveGamePage'; // New import

const TARGET_SCORE = 100;
const HAND_WIN_BONUS = 20;

type AppView = 'landing' | 'settings' | 'game' | 'pastGames' | 'userManagement';
export type PlayerSelectionData = { id: string | null; name?: string };


const initialGameStats: GameStats = {
  player1CumulativeScore: 0,
  player2CumulativeScore: 0,
  player1HandsWon: 0,
  player2HandsWon: 0,
};

const backgroundImageDataUri = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgdmlld0JveD0iMCAwIDE2IDE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiMyOTMxMzgiLz48cGF0aCBkPSJNMCA0IEw0IDAgTDggNCBNOCA0IEwxMiAwIEwxNiA0IE0wIDEyIEw0IDggTDggMTIgTTggMTIgTDEyIDggTDE2IDEyIiBzdHJva2U9IiMzNjNjNDMiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0KSIvPjwvc3ZnPg==';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    player1Id: null,
    player2Id: null,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
  });
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [hands, setHands] = useState<HandResult[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>(initialGameStats);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<FinalGameResult | null>(null);
  const [aiGameSummary, setAiGameSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For loading states

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsersAPI();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Optionally set an error state to display to the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleUpdateUser = useCallback(async (updatedUser: User) => {
    setIsLoading(true);
    try {
      const returnedUser = await updateUserNameAPI(updatedUser.id, updatedUser.name);
      setUsers(prevUsers => prevUsers.map(u => u.id === returnedUser.id ? returnedUser : u));
    } catch (error) {
      console.error(`Failed to update user ${updatedUser.id}:`, error);
      // Optionally set an error state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteUser = useCallback(async (userIdToDelete: string) => {
    setIsLoading(true);
    try {
      await deleteUserAPI(userIdToDelete);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToDelete));
       // If the deleted user was part of current game settings, reset.
      if (settings.player1Id === userIdToDelete || settings.player2Id === userIdToDelete) {
        // This scenario should ideally be handled by preventing deletion if user is in active game,
        // or by abandoning the game. For now, just clear settings partially.
        // A more robust solution would be needed for active games.
        if (isGameActive) {
            alert("A user in the active game was deleted. The game might become unstable. Returning to landing.");
            handleReturnToLanding();
        } else {
             setSettings(prev => ({
                ...prev,
                player1Id: prev.player1Id === userIdToDelete ? null : prev.player1Id,
                player2Id: prev.player2Id === userIdToDelete ? null : prev.player2Id,
             }));
        }
      }
    } catch (error) {
      console.error(`Failed to delete user ${userIdToDelete}:`, error);
      // Optionally set an error state
    } finally {
      setIsLoading(false);
    }
  }, [settings.player1Id, settings.player2Id, isGameActive]); // Added handleReturnToLanding to deps if it's used inside this callback for consistency, not strictly necessary here though
  
  const derivePlayerName = useCallback((playerId: string | null): string => {
    if (!playerId) return 'Player';
    const user = users.find(u => u.id === playerId);
    return user ? user.name : 'Player (Unknown)';
  }, [users]);

  const calculateStats = useCallback((currentHands: HandResult[]): GameStats => {
    return currentHands.reduce(
      (acc, hand) => {
        acc.player1CumulativeScore += hand.player1Score;
        acc.player2CumulativeScore += hand.player2Score;
        if (hand.winner === HandWinner.Player1) {
          acc.player1HandsWon += 1;
        } else if (hand.winner === HandWinner.Player2) {
          acc.player2HandsWon += 1;
        }
        return acc;
      },
      { ...initialGameStats } 
    );
  }, []);

  useEffect(() => {
    const processGameOver = async () => {
      if (!isGameActive || currentView !== 'game' || !settings.player1Id || !settings.player2Id) return;

      const currentStats = calculateStats(hands);
      setGameStats(currentStats); // Update stats for UI immediately
      
      const p1Name = derivePlayerName(settings.player1Id);
      const p2Name = derivePlayerName(settings.player2Id);

      if (
        currentStats.player1CumulativeScore >= TARGET_SCORE ||
        currentStats.player2CumulativeScore >= TARGET_SCORE
      ) {
        setIsLoading(true);
        setAiGameSummary('Generating AI summary...'); // Placeholder while API call is made

        const p1Final = currentStats.player1CumulativeScore + currentStats.player1HandsWon * HAND_WIN_BONUS;
        const p2Final = currentStats.player2CumulativeScore + currentStats.player2HandsWon * HAND_WIN_BONUS;

        let winnerName = '';
        let winnerId: string | null = null;

        if (p1Final > p2Final) {
          winnerName = p1Name;
          winnerId = settings.player1Id;
        } else if (p2Final > p1Final) {
          winnerName = p2Name;
          winnerId = settings.player2Id;
        } else {
          winnerName = 'It\'s a Tie!';
        }

        const calculatedFinalResult: FinalGameResult = {
          player1FinalScore: p1Final,
          player2FinalScore: p2Final,
          winnerName,
          winnerId: winnerId,
          player1Name: p1Name,
          player2Name: p2Name,
          player1Id: settings.player1Id,
          player2Id: settings.player2Id,
          player1Cumulative: currentStats.player1CumulativeScore,
          player2Cumulative: currentStats.player2CumulativeScore,
          player1HandsWon: currentStats.player1HandsWon,
          player2HandsWon: currentStats.player2HandsWon,
          handWinBonus: HAND_WIN_BONUS,
        };
        
        setFinalResult(calculatedFinalResult);
        setShowGameOverModal(true);
        setIsGameActive(false); 
        
        const gameToStore: Omit<StoredGame, 'id' | 'date' | 'aiSummary'> = {
          settings: {
               player1Id: settings.player1Id, 
               player2Id: settings.player2Id,
               player1Name: p1Name, 
               player2Name: p2Name,
          },
          hands: [...hands],
          finalResult: calculatedFinalResult,
        };
        
        try {
            const savedGame = await saveCompletedGameAPI(gameToStore);
            if (savedGame.aiSummary) {
              setAiGameSummary(savedGame.aiSummary);
            } else {
              setAiGameSummary("AI summary was not provided by the server.");
            }
            await fetchUsers();
        } catch (error) {
            console.error("Failed to save game or fetch users post-game:", error);
            setAiGameSummary("Failed to retrieve AI summary due to an error saving the game.");
        } finally {
            setIsLoading(false);
        }
      }
    };
    
    processGameOver();

  }, [hands, isGameActive, calculateStats, settings, currentView, users, fetchUsers, derivePlayerName]);


  const handleReturnToLanding = useCallback(() => {
    setIsGameActive(false);
    setShowGameOverModal(false);
    setHands([]);
    setGameStats({ ...initialGameStats });
    setFinalResult(null);
    setAiGameSummary(null); 
    setCurrentView('landing');
    setSettings(prev => ({ 
        ...prev,
        player1Id: null,
        player2Id: null,
        // Keep existing player names as default if they were set from users,
        // or reset to generic if not based on user selection
        player1Name: prev.player1Id ? derivePlayerName(prev.player1Id) : 'Player 1',
        player2Name: prev.player2Id ? derivePlayerName(prev.player2Id) : 'Player 2',
    }));
  }, [derivePlayerName]); // Added derivePlayerName
  
  const handleGameSetupComplete = useCallback(async (p1Data: PlayerSelectionData, p2Data: PlayerSelectionData) => {
    setIsLoading(true);
    let finalP1Id: string | null = null;
    let finalP2Id: string | null = null;
    let p1Name = 'Player 1';
    let p2Name = 'Player 2';
    let newUsersCreatedThisSession: User[] = []; 

    try {
        if (p1Data.id === CREATE_NEW_USER_ID && p1Data.name) {
            const newUser = await createUserAPI(p1Data.name);
            finalP1Id = newUser.id;
            p1Name = newUser.name;
            newUsersCreatedThisSession.push(newUser);
        } else if (p1Data.id) {
            finalP1Id = p1Data.id;
            p1Name = derivePlayerName(finalP1Id);
        }

        if (p2Data.id === CREATE_NEW_USER_ID && p2Data.name) {
            if (p1Data.id === CREATE_NEW_USER_ID && p1Data.name && p1Data.name.toLowerCase() === p2Data.name.toLowerCase()) {
                 alert("New player names must be unique.");
                 setIsLoading(false);
                 return;
            }
            const newUser = await createUserAPI(p2Data.name);
            finalP2Id = newUser.id;
            p2Name = newUser.name;
            newUsersCreatedThisSession.push(newUser);
        } else if (p2Data.id) {
            finalP2Id = p2Data.id;
            p2Name = derivePlayerName(finalP2Id);
        }

        if (newUsersCreatedThisSession.length > 0) {
            setUsers(prev => [...prev, ...newUsersCreatedThisSession]);
            // Update names based on newly created users if they were selected
            if (newUsersCreatedThisSession.find(u => u.id === finalP1Id)) p1Name = newUsersCreatedThisSession.find(u => u.id === finalP1Id)!.name;
            if (newUsersCreatedThisSession.find(u => u.id === finalP2Id)) p2Name = newUsersCreatedThisSession.find(u => u.id === finalP2Id)!.name;
        }
        
        if (!finalP1Id || !finalP2Id) {
            alert("Both players must be selected or created.");
            setIsLoading(false);
            return;
        }
        if (finalP1Id === finalP2Id) {
            alert("Players must be different.");
            setIsLoading(false);
            return;
        }
        
        setSettings({
            player1Id: finalP1Id,
            player2Id: finalP2Id,
            player1Name: p1Name,
            player2Name: p2Name,
        });
        setHands([]);
        setGameStats({ ...initialGameStats });
        setIsGameActive(true);
        setShowGameOverModal(false);
        setFinalResult(null);
        setAiGameSummary(null); 
        setCurrentView('game');

    } catch (error) {
        console.error("Error setting up game:", error);
        alert(`Error setting up game: ${error instanceof Error ? error.message : "Unknown error"}`);
        if (newUsersCreatedThisSession.length > 0) {
            fetchUsers(); 
        }
    } finally {
        setIsLoading(false);
    }
  }, [users, fetchUsers, derivePlayerName]);

  const handleAddHand = useCallback((p1Score: number, p2Score: number) => {
    if (!isGameActive) return;

    let winner: HandWinner | null = null;
    if (p1Score > 0 && p1Score >= p2Score) {
        winner = HandWinner.Player1;
    } else if (p2Score > 0 && p2Score > p1Score) {
        winner = HandWinner.Player2;
    } else if (p1Score === 0 && p2Score === 0) {
        winner = HandWinner.Tie;
    } else if (p1Score > 0 && p2Score <= 0) {
        winner = HandWinner.Player1; 
    } else if (p2Score > 0 && p1Score <= 0) {
        winner = HandWinner.Player2;
    }
    
    const newHand: HandResult = {
      id: `hand-${hands.length + 1}-${Date.now()}`, 
      player1Score: p1Score,
      player2Score: p2Score,
      winner,
    };
    setHands((prevHands) => [...prevHands, newHand]);
  }, [isGameActive, hands.length]);

  const gamePlayer1Name = settings.player1Id ? derivePlayerName(settings.player1Id) : settings.player1Name;
  const gamePlayer2Name = settings.player2Id ? derivePlayerName(settings.player2Id) : settings.player2Name;


  return (
    <div 
      className="min-h-screen py-8 px-4 flex flex-col items-center"
      style={{
        backgroundColor: '#293138', 
        backgroundImage: `url("${backgroundImageDataUri}")`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'repeat',
      }}
    >
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-100">Gin Rummy Scorer</h1>
      </header>

      <main className="w-full max-w-3xl bg-white shadow-xl rounded-lg p-6 md:p-8 relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <div className="text-blue-600 text-lg">Loading...</div>
            </div>
        )}
        {currentView === 'landing' && (
          <LandingPage 
            onStartNewGame={() => setCurrentView('settings')} 
            onViewPastGames={() => setCurrentView('pastGames')} 
            onManageUsers={() => setCurrentView('userManagement')}
          />
        )}
        {currentView === 'settings' && (
          <GameSettingsPage 
            users={users}
            onStartGame={handleGameSetupComplete}
            onBack={handleReturnToLanding}
          />
        )}
        {currentView === 'pastGames' && (
          <PastGamesPage 
            onBack={handleReturnToLanding} 
          />
        )}
        {currentView === 'userManagement' && (
            <UserManagementPage
                users={users}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onBack={handleReturnToLanding}
            />
        )}
        {currentView === 'game' && settings.player1Id && settings.player2Id && (
          <ActiveGamePage
            settings={{
                player1Id: settings.player1Id,
                player2Id: settings.player2Id,
                player1Name: gamePlayer1Name,
                player2Name: gamePlayer2Name
            }}
            stats={gameStats}
            hands={hands}
            targetScore={TARGET_SCORE}
            handWinBonus={HAND_WIN_BONUS}
            onAddHand={handleAddHand}
            onAbandonGame={handleReturnToLanding}
            isGameActive={isGameActive}
          />
        )}
      </main>

      {showGameOverModal && finalResult && (currentView === 'game' || currentView === 'settings' || finalResult != null) && (
        <GameOverModal 
            result={finalResult} 
            onClose={handleReturnToLanding} 
            aiGameSummary={aiGameSummary}
        />
      )}

      <footer className="mt-12 text-center text-sm text-slate-300">
        <p>&copy; {new Date().getFullYear()} Gin Rummy Scorer. Built with React & Tailwind CSS.</p>
        <p>Game rules: First to {TARGET_SCORE} points. {HAND_WIN_BONUS} bonus points per hand won.</p>
      </footer>
    </div>
  );
};

export default App;