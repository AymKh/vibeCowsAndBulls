import { Injectable } from '@angular/core';
import { GameState, GuessResult } from '../common/types';



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

  public startNewGame(): void {
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

  public makeGuess(input: number): GuessResult | null {
    const guess = input.toString()
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

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getSecretNumber(): string {
    return this.gameState.secretNumber;
  }
}
