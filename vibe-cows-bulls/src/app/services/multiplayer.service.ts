import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, GuessResult, Room, Player, HostGrade } from '../common/types';

@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {
  private socket: Socket;
  private connected = new BehaviorSubject<boolean>(false);
  private currentRoom = new BehaviorSubject<Room | null>(null);
  private gameState = new BehaviorSubject<GameState | null>(null);
  private currentPlayer = new BehaviorSubject<string | null>(null);
  private error = new BehaviorSubject<string | null>(null);
  private guessResult = new BehaviorSubject<GuessResult | null>(null);
  private pendingGuess = new BehaviorSubject<HostGrade | null>(null); // New: for host grading

  constructor() {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.connected.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected.next(false);
    });

    this.socket.on('room-created', (data: { roomId: string, room: Room }) => {
      this.currentRoom.next(data.room);
    });

    this.socket.on('player-joined', (data: { room: Room, newPlayer: Player }) => {
      this.currentRoom.next(data.room);
    });

    this.socket.on('player-ready-update', (data: { players: Player[], allReady: boolean }) => {
      const room = this.currentRoom.value;
      if (room) {
        room.players = data.players;
        this.currentRoom.next(room);
      }
    });

    this.socket.on('game-started', (data: { gameState: GameState, currentPlayer: string }) => {
      this.gameState.next(data.gameState);
      this.currentPlayer.next(data.currentPlayer);
      const room = this.currentRoom.value;
      if (room) {
        room.gameStarted = true;
        room.gameState = data.gameState;
        this.currentRoom.next(room);
      }
    });

    this.socket.on('guess-result', (data: { guessResult: GuessResult, gameState: GameState, currentPlayer: string }) => {
      this.guessResult.next(data.guessResult);
      this.gameState.next(data.gameState);
      this.currentPlayer.next(data.currentPlayer);
      const room = this.currentRoom.value;
      if (room) {
        room.gameState = data.gameState;
        this.currentRoom.next(room);
      }
    });

    // New: Listen for guesses that need grading (host mode)
    this.socket.on('guess-for-grading', (data: { guess: HostGrade }) => {
      this.pendingGuess.next(data.guess);
    });

    // New: Listen for secret number set confirmation
    this.socket.on('secret-number-set', (data: { success: boolean }) => {
      if (data.success) {
        console.log('Secret number set successfully');
      }
    });

    this.socket.on('new-game-created', (data: { players: Player[] }) => {
      const room = this.currentRoom.value;
      if (room) {
        room.players = data.players;
        room.gameStarted = false;
        room.gameState = {
          secretNumber: '',
          guesses: [],
          isGameWon: false,
          isGameOver: false,
          maxAttempts: 10
        };
        this.currentRoom.next(room);
      }
      this.gameState.next(null);
      this.currentPlayer.next(null);
      this.pendingGuess.next(null);
    });

    this.socket.on('player-left', (data: { room: Room, leftPlayerId: string }) => {
      this.currentRoom.next(data.room);
    });

    this.socket.on('error', (errorMsg: string) => {
      this.error.next(errorMsg);
    });
  }

  createRoom(playerName: string, gameMode: 'competitive' | 'host' = 'competitive'): void {
    console.log('Service emitting create-room with:', { playerName, gameMode });
    this.socket.emit('create-room', { playerName, gameMode });
  }

  joinRoom(roomId: string, playerName: string): void {
    this.socket.emit('join-room', { roomId, playerName });
  }

  setPlayerReady(): void {
    this.socket.emit('player-ready');
  }

  makeGuess(guess: string): void {
    this.socket.emit('make-guess', { guess });
  }

  // New: Set secret number (host mode)
  setSecretNumber(secretNumber: string): void {
    this.socket.emit('set-secret-number', { secretNumber });
  }

  // New: Grade a guess (host mode)
  gradeGuess(guess: string, cows: number, bulls: number): void {
    this.socket.emit('grade-guess', { guess, cows, bulls });
  }

  startNewGame(): void {
    this.socket.emit('new-game');
  }

  get connected$(): Observable<boolean> {
    return this.connected.asObservable();
  }

  get currentRoom$(): Observable<Room | null> {
    return this.currentRoom.asObservable();
  }

  get gameState$(): Observable<GameState | null> {
    return this.gameState.asObservable();
  }

  get currentPlayer$(): Observable<string | null> {
    return this.currentPlayer.asObservable();
  }

  get error$(): Observable<string | null> {
    return this.error.asObservable();
  }

  get guessResult$(): Observable<GuessResult | null> {
    return this.guessResult.asObservable();
  }

  // New: Observable for pending guesses that need grading
  get pendingGuess$(): Observable<HostGrade | null> {
    return this.pendingGuess.asObservable();
  }

  clearError(): void {
    this.error.next(null);
  }

  getSocketId(): any {
    return this.socket.id;
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
