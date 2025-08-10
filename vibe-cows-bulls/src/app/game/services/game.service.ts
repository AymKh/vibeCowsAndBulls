import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState: GameState = {
    secretNumber: '',
    guesses: [],
    isGameWon: false,
    isGameOver: false,
    maxAttempts: 10
  };

  constructor() {
    this.startNewGame();
  }

  startNewGame(): void {
    this.gameState = {
      secretNumber: this.generateSecretNumber(),
      guesses: [],
      isGameWon: false,
      isGameOver: false,
      maxAttempts: 10
    };
  }

  private generateSecretNumber(): string {
    const digits = '0123456789'.split('');
    let result = '';
    
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      result += digits[randomIndex];
      digits.splice(randomIndex, 1);
    }
    
    return result;
  }

  makeGuess(guess: string): GuessResult | null {
    if (this.gameState.isGameOver || !this.isValidGuess(guess)) {
      return null;
    }

    const result = this.calculateCowsAndBulls(guess, this.gameState.secretNumber);
    const guessResult: GuessResult = {
      guess,
      cows: result.cows,
      bulls: result.bulls,
      attempt: this.gameState.guesses.length + 1
    };

    this.gameState.guesses.push(guessResult);

    if (result.bulls === 4) {
      this.gameState.isGameWon = true;
      this.gameState.isGameOver = true;
    } else if (this.gameState.guesses.length >= this.gameState.maxAttempts) {
      this.gameState.isGameOver = true;
    }

    return guessResult;
  }

  private isValidGuess(guess: string): boolean {
    if (guess.length !== 4) return false;
    if (!/^\d+$/.test(guess)) return false;
    const uniqueDigits = new Set(guess.split(''));
    return uniqueDigits.size === 4;
  }

  private calculateCowsAndBulls(guess: string, secret: string): { cows: number, bulls: number } {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === secret[i]) {
        bulls++;
      } else if (secret.includes(guess[i])) {
        cows++;
      }
    }

    return { cows, bulls };
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  getSecretNumber(): string {
    return this.gameState.secretNumber;
  }
}
