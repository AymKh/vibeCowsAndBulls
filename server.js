const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "https://cab.maak-corp.tn",
      /\.netlify\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'vibe-cows-bulls/dist')));

const rooms = new Map();

function generateSecretNumber() {
  const digits = '0123456789'.split('');
  let result = '';

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    result += digits[randomIndex];
    digits.splice(randomIndex, 1);
  }

  return result;
}

function calculateCowsAndBulls(guess, secret) {
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

function isValidGuess(guess) {
  if (guess.length !== 4) return false;
  if (!/^\d+$/.test(guess)) return false;
  const uniqueDigits = new Set(guess.split(''));
  return uniqueDigits.size === 4;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', ({ playerName, gameMode = 'competitive' }) => {
    console.log('Creating room with gameMode:', gameMode, 'for player:', playerName);
    const roomId = Math.random().toString(36).substring(2, 8);
    const room = {
      id: roomId,
      players: [{
        id: socket.id,
        name: playerName,
        isReady: false,
        role: gameMode === 'host' ? 'host' : null
      }],
      gameState: {
        secretNumber: gameMode === 'host' ? '' : generateSecretNumber(),
        guesses: [],
        isGameWon: false,
        isGameOver: false,
        maxAttempts: 10,
        currentPlayer: null,
        winner: null
      },
      gameStarted: false,
      gameMode: gameMode,
      hostId: gameMode === 'host' ? socket.id : null
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.roomId = roomId;

    socket.emit('room-created', {
      roomId,
      room
    });
  });

  socket.on('join-room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      isReady: false,
      role: room.gameMode === 'host' ? 'guesser' : null
    };

    room.players.push(player);
    socket.join(roomId);
    socket.roomId = roomId;

    io.to(roomId).emit('player-joined', {
      room,
      newPlayer: player
    });
  });

  socket.on('player-ready', () => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    // In host mode, host must set secret number before being ready
    if (room.gameMode === 'host' && room.hostId === socket.id && !room.gameState.secretNumber) {
      socket.emit('error', 'You must set a secret number before being ready');
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    const allReady = room.players.length === 2 && room.players.every(p => p.isReady);

    io.to(roomId).emit('player-ready-update', {
      players: room.players,
      allReady
    });

    if (allReady && !room.gameStarted) {
      room.gameStarted = true;

      if (room.gameMode === 'host') {
        // In host mode, only the guesser makes guesses
        const guesser = room.players.find(p => p.role === 'guesser');
        room.gameState.currentPlayer = guesser ? guesser.id : room.players[1].id;
      } else {
        // In competitive mode, first player starts
        room.gameState.currentPlayer = room.players[0].id;
      }

      io.to(roomId).emit('game-started', {
        gameState: {
          ...room.gameState,
          secretNumber: undefined
        },
        currentPlayer: room.gameState.currentPlayer
      });
    }
  });

  socket.on('set-secret-number', ({ secretNumber }) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room || room.gameMode !== 'host' || room.hostId !== socket.id) {
      socket.emit('error', 'Not authorized to set secret number');
      return;
    }

    if (!isValidGuess(secretNumber)) {
      socket.emit('error', 'Invalid secret number');
      return;
    }

    room.gameState.secretNumber = secretNumber;

    io.to(roomId).emit('secret-number-set', {
      success: true
    });
  });

  socket.on('make-guess', ({ guess }) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room || !room.gameStarted || room.gameState.isGameOver) return;

    if (room.gameState.currentPlayer !== socket.id) {
      socket.emit('error', 'Not your turn');
      return;
    }

    if (!isValidGuess(guess)) {
      socket.emit('error', 'Invalid guess');
      return;
    }

    if (room.gameMode === 'host') {
      // In host mode, send guess to host for grading
      const hostSocket = io.sockets.sockets.get(room.hostId);
      if (hostSocket) {
        const guessForGrading = {
          guess,
          attempt: room.gameState.guesses.length + 1,
          playerId: socket.id,
          playerName: room.players.find(p => p.id === socket.id)?.name
        };

        hostSocket.emit('guess-for-grading', {
          guess: guessForGrading
        });
      }
    } else {
      // Competitive mode - calculate automatically
      const result = calculateCowsAndBulls(guess, room.gameState.secretNumber);
      const guessResult = {
        guess,
        cows: result.cows,
        bulls: result.bulls,
        attempt: room.gameState.guesses.length + 1,
        playerId: socket.id,
        playerName: room.players.find(p => p.id === socket.id)?.name
      };

      room.gameState.guesses.push(guessResult);

      if (result.bulls === 4) {
        room.gameState.isGameWon = true;
        room.gameState.isGameOver = true;
        room.gameState.winner = socket.id;
      } else if (room.gameState.guesses.length >= room.gameState.maxAttempts) {
        room.gameState.isGameOver = true;
      } else {
        const currentPlayerIndex = room.players.findIndex(p => p.id === socket.id);
        const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
        room.gameState.currentPlayer = room.players[nextPlayerIndex].id;
      }

      io.to(roomId).emit('guess-result', {
        guessResult,
        gameState: {
          ...room.gameState,
          secretNumber: room.gameState.isGameOver ? room.gameState.secretNumber : undefined
        },
        currentPlayer: room.gameState.currentPlayer
      });
    }
  });

  socket.on('grade-guess', ({ guess, cows, bulls }) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room || room.gameMode !== 'host' || room.hostId !== socket.id) {
      socket.emit('error', 'Not authorized to grade guesses');
      return;
    }

    if (cows + bulls > 4 || cows < 0 || bulls < 0) {
      socket.emit('error', 'Invalid grade: cows + bulls cannot exceed 4');
      return;
    }

    const guessResult = {
      guess,
      cows,
      bulls,
      attempt: room.gameState.guesses.length + 1,
      playerId: room.gameState.currentPlayer,
      playerName: room.players.find(p => p.id === room.gameState.currentPlayer)?.name
    };

    room.gameState.guesses.push(guessResult);

    if (bulls === 4) {
      room.gameState.isGameWon = true;
      room.gameState.isGameOver = true;
      room.gameState.winner = room.gameState.currentPlayer;
    } else if (room.gameState.guesses.length >= room.gameState.maxAttempts) {
      room.gameState.isGameOver = true;
    }

    io.to(roomId).emit('guess-result', {
      guessResult,
      gameState: {
        ...room.gameState,
        secretNumber: room.gameState.isGameOver ? room.gameState.secretNumber : undefined
      },
      currentPlayer: room.gameState.currentPlayer
    });
  });

  socket.on('new-game', () => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    room.gameState = {
      secretNumber: room.gameMode === 'host' ? '' : generateSecretNumber(),
      guesses: [],
      isGameWon: false,
      isGameOver: false,
      maxAttempts: 10,
      currentPlayer: room.players[0].id,
      winner: null
    };

    room.players.forEach(player => {
      player.isReady = false;
    });

    room.gameStarted = false;

    io.to(roomId).emit('new-game-created', {
      players: room.players
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);

      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('player-left', {
          room,
          leftPlayerId: socket.id
        });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});