export interface GameState {
  secretNumber: string;
  guesses: GuessResult[];
  isGameWon: boolean;
  isGameOver: boolean;
  maxAttempts: number;
  currentPlayer?: string;
  winner?: string;
}

export interface GuessResult {
  guess: string;
  cows: number;
  bulls: number;
  attempt: number;
  playerId?: string;
  playerName?: string;
}

export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  role?: 'host' | 'guesser'; // New: player role in host mode
}

export interface Room {
  id: string;
  players: Player[];
  gameState: GameState;
  gameStarted: boolean;
  gameMode: 'competitive' | 'host'; // New: game mode
  hostId?: string; // New: ID of the host player
}

// New: Interface for host grading
export interface HostGrade {
  guess: string;
  cows: number;
  bulls: number;
  attempt: number;
  playerId: string;
  playerName: string;
}
