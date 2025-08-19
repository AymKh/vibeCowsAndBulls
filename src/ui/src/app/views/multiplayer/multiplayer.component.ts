import { Component, OnInit, OnDestroy } from '@angular/core';
import { MultiplayerService } from '../../services/multiplayer.service';
import { Room, GameState, HostGrade } from '../../common/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit, OnDestroy {
  playerName = '';
  roomId = '';
  currentGuess: number = 0;
  selectedGameMode: 'competitive' | 'host' = 'competitive';
  secretNumber = '';
  pendingGrade: HostGrade | null = null;
  gradeCows = 0;
  gradeBulls = 0;

  connected = false;
  currentRoom: Room | null = null;
  gameState: GameState | null = null;
  currentPlayer: string | null = null;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private multiplayerService: MultiplayerService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.multiplayerService.connected$.subscribe(connected => {
        this.connected = connected;
      }),

      this.multiplayerService.currentRoom$.subscribe(room => {
        this.currentRoom = room;
      }),

      this.multiplayerService.gameState$.subscribe(gameState => {
        this.gameState = gameState;
      }),

      this.multiplayerService.currentPlayer$.subscribe(currentPlayer => {
        this.currentPlayer = currentPlayer;
      }),

      this.multiplayerService.error$.subscribe(error => {
        this.error = error;
      }),

      this.multiplayerService.guessResult$.subscribe(result => {
        if (result) {
          this.currentGuess = 0;
        }
      }),

      // New: Subscribe to pending guesses for grading
      this.multiplayerService.pendingGuess$.subscribe(guess => {
        this.pendingGrade = guess;
        if (guess) {
          this.gradeCows = 0;
          this.gradeBulls = 0;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createRoom(): void {
    if (this.playerName.trim()) {
      console.log('Creating room with mode:', this.selectedGameMode);
      this.multiplayerService.createRoom(this.playerName, this.selectedGameMode);
    }
  }

  joinRoom(): void {
    if (this.playerName.trim() && this.roomId.trim()) {
      this.multiplayerService.joinRoom(this.roomId, this.playerName);
    }
  }

  setReady(): void {
    this.multiplayerService.setPlayerReady();
  }

  makeGuess(): void {
    if (this.currentGuess.toString().trim()) {
      this.multiplayerService.makeGuess(this.currentGuess.toString());
    }
  }

  // New: Set secret number (host mode)
  setSecretNumber(): void {
    if (this.secretNumber.length === 4 && /^\d{4}$/.test(this.secretNumber)) {
      const uniqueDigits = new Set(this.secretNumber.split(''));
      if (uniqueDigits.size === 4) {
        this.multiplayerService.setSecretNumber(this.secretNumber);
      }
    }
  }

  // New: Grade a guess (host mode)
  submitGrade(): void {
    if (this.pendingGrade && this.gradeCows + this.gradeBulls <= 4) {
      this.multiplayerService.gradeGuess(
        this.pendingGrade.guess,
        this.gradeCows,
        this.gradeBulls
      );
      this.pendingGrade = null;
    }
  }

  startNewGame(): void {
    this.multiplayerService.startNewGame();
  }

  clearError(): void {
    this.multiplayerService.clearError();
  }

  isMyTurn(): boolean {
    return this.currentPlayer === this.multiplayerService.getSocketId();
  }

  getCurrentPlayerName(): string {
    if (!this.currentRoom || !this.currentPlayer) return '';
    const player = this.currentRoom.players.find(p => p.id === this.currentPlayer);
    return player?.name || '';
  }

  getWinnerName(): string {
    if (!this.currentRoom || !this.gameState?.winner) return '';
    const winner = this.currentRoom.players.find(p => p.id === this.gameState?.winner);
    return winner?.name || '';
  }

  isValidGuess(): boolean {
    return true
    if (this.currentGuess.toString().length !== 4) return false;
    if (!/^\d+$/.test(this.currentGuess.toString())) return false;
    const uniqueDigits = new Set(this.currentGuess.toString().split(''));
    return uniqueDigits.size === 4;
  }

  // Computed properties to avoid method calls in template
  get isCurrentPlayerReady(): boolean {
    if (!this.currentRoom) return false;
    const socketId = this.multiplayerService.getSocketId();
    const player = this.currentRoom.players.find(p => p.id === socketId);
    return player?.isReady || false;
  }

  get readyButtonText(): string {
    if (this.isCurrentPlayerReady) return 'Ready!';

    if (this.currentRoom?.gameMode === 'host' && this.isHost) {
      return this.currentRoom.gameState.secretNumber ? 'Ready Up' : 'Set Secret Number First';
    }

    return 'Ready Up';
  }

  get canReady(): boolean {
    if (this.isCurrentPlayerReady) return false;

    if (this.currentRoom?.gameMode === 'host' && this.isHost) {
      return !!this.currentRoom.gameState.secretNumber;
    }

    return true;
  }

  // New: Check if current player is the host
  get isHost(): boolean {
    if (!this.currentRoom) return false;
    const socketId = this.multiplayerService.getSocketId();
    return this.currentRoom.hostId === socketId;
  }

  // New: Check if current player is the guesser
  get isGuesser(): boolean {
    if (!this.currentRoom) return false;
    return !this.isHost;
  }

  // New: Check if secret number is valid
  get isSecretNumberValid(): boolean {
    return this.secretNumber.length === 4 &&
      /^\d{4}$/.test(this.secretNumber) &&
      new Set(this.secretNumber.split('')).size === 4;
  }

  // New: Check if grade is valid
  get isGradeValid(): boolean {
    return this.gradeCows + this.gradeBulls <= 4;
  }
}
