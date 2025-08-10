export interface GameState {
  secretNumber: string;
  guesses: GuessResult[];
  isGameWon: boolean;
  isGameOver: boolean;
  maxAttempts: number;
}

export interface GuessResult {
  guess: string;
  cows: number;
  bulls: number;
  attempt: number;
}
