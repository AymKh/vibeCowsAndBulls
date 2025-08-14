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

## Rules
- Secret numbers must be 4 digits (0-9) with unique digits
- Cows: Correct digit in wrong position
- Bulls: Correct digit in correct position
- Maximum attempts: 10 (configurable)
- Players must be ready before the game can start


## Technology Stack
- **Frontend**: Angular 17, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Real-time Communication**: WebSockets via Socket.io
- **Styling**: Tailwind CSS for responsive design
