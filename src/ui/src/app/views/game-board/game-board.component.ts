import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { GameState, GuessResult } from '../../common/types';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {

  protected array = new Array(10)

  protected gameState: GameState;
  protected currentGuess: number = 0;
  protected errorMessage: string = '';

  constructor(
    public gameService: GameService
  ) {
    this.gameState = this.gameService.getGameState();
  }

  protected onGuessSubmit(): void {
    this.errorMessage = '';

    if (!this.isValidInput(this.currentGuess)) {
      this.errorMessage = 'Please enter a 4-digit number with unique digits';
      return;
    }

    const result = this.gameService.makeGuess(this.currentGuess);
    if (result) {
      this.gameState = this.gameService.getGameState();
      this.currentGuess = 0;
    } else {
      this.errorMessage = 'Invalid guess. Please try again.';
    }
  }

  protected isValidInput(input: number): boolean {
    const guess = input.toString()
    if (guess.length !== 4) return false;
    if (!/^\d+$/.test(guess)) return false;
    const uniqueDigits = new Set(guess.split(''));
    return uniqueDigits.size === 4;
  }

  protected startNewGame(): void {
    this.gameService.startNewGame();
    this.gameState = this.gameService.getGameState();
    this.currentGuess = 0;
    this.errorMessage = '';
  }

  protected getRemainingAttempts(): number {
    return this.gameState.maxAttempts - this.gameState.guesses.length;
  }

  protected trackByAttempt(_index: number, guess: GuessResult): number {
    return guess.attempt;
  }
}
