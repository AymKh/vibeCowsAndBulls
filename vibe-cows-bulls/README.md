# Vibe Cows & Bulls

A multiplayer implementation of the classic Cows and Bulls number guessing game built with Angular and Node.js.

## Game Modes

### 1. Competitive Mode (Default)
- Both players try to guess the same randomly generated secret number
- First player to guess correctly wins
- Players take turns making guesses
- Each guess gets graded with cows (correct digit, wrong position) and bulls (correct digit, correct position)

### 2. Host Mode (New!)
- One player acts as the "Host" who picks the secret number
- The other player acts as the "Guesser" who tries to figure out the number
- Host grades each guess manually (assigns cows and bulls)
- Game continues until the guesser finds the correct number
- Perfect for playing with friends where you want full control over the game

## How to Play

### Competitive Mode
1. Choose "Competitive" mode when creating a room
2. Both players join the room and ready up
3. Game starts automatically with a random secret number
4. Players take turns guessing 4-digit numbers
5. Each guess receives feedback in the form of cows and bulls
6. First player to guess correctly wins!

### Host Mode
1. Choose "Host" mode when creating a room
2. Host player joins and sets a secret 4-digit number
3. Guesser player joins the room
4. Host marks themselves as ready
5. Guesser makes guesses
6. Host manually grades each guess with cows and bulls
7. Game continues until the guesser finds the correct number

## Rules
- Secret numbers must be 4 digits (0-9) with unique digits
- Cows: Correct digit in wrong position
- Bulls: Correct digit in correct position
- Maximum attempts: 10 (configurable)
- Players must be ready before the game can start

## Features
- Real-time multiplayer gameplay
- Beautiful, responsive UI with Tailwind CSS
- Socket.io for real-time communication
- Game state management
- Player roles and permissions
- Guess history tracking
- Error handling and validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd vibe-cows-bulls
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Start the Angular app:
   ```bash
   cd vibe-cows-bulls
   npm start
   ```
5. Open your browser to `http://localhost:4200`

## Technology Stack
- **Frontend**: Angular 17, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Real-time Communication**: WebSockets via Socket.io
- **Styling**: Tailwind CSS for responsive design

## Game Flow
1. Player creates or joins a room
2. Players ready up
3. Game starts (either automatically or after host sets number)
4. Players take turns making guesses
5. Game continues until someone wins or max attempts reached
6. Option to start a new game

Enjoy playing Cows and Bulls with friends!
