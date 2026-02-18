# Multiplayer Tic-Tac-Toe Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account

## Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Give your project a name (e.g., "tic-tac-toe-multiplayer")

2. **Enable Realtime Database**
   - In your Firebase project, go to "Build" → "Realtime Database"
   - Click "Create Database"
   - Choose a location (e.g., us-central1)
   - Start in "Test mode" for development (you can secure it later)

3. **Get Firebase Configuration**
   - Go to Project Settings (gear icon) → General
   - Scroll down to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Register your app with a nickname
   - Copy the Firebase configuration object

4. **Update Firebase Config**
   - Open `config/firebase.ts`
   - Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. **Set Database Rules (Optional but Recommended)**
   - Go to Realtime Database → Rules
   - For development, you can use:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

   - For production, implement proper security rules

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Development Server**
```bash
npm start
```

3. **Run on Your Platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

## How to Play

1. **Create a Game**
   - Open the app and tap "Create New Game"
   - You'll receive a Game ID
   - Share this ID with your opponent

2. **Join a Game**
   - Enter the Game ID in the "Join Game" field
   - Tap "Join Game"
   - Or select from the list of available games

3. **Play**
   - Player 1 is X, Player 2 is O
   - X goes first
   - Tap an empty cell to place your mark
   - First player to get 3 in a row wins!

## Testing Multiplayer

To test multiplayer functionality:

1. Open the app on two different devices/browsers
2. Create a game on device 1
3. Copy the Game ID
4. Join the game on device 2 using the Game ID
5. Play the game - moves should sync in real-time!

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config is correct
- Check that Realtime Database is enabled
- Ensure database rules allow read/write access

### App Not Loading
- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Moves Not Syncing
- Check your internet connection
- Verify Firebase Realtime Database is active
- Check browser console for errors

## Project Structure

```
├── app/
│   ├── (tabs)/
│   │   └── index.tsx          # Lobby screen
│   ├── game/
│   │   └── [id].tsx           # Game board screen
│   └── _layout.tsx            # Root layout
├── components/
│   ├── GameBoard.tsx          # 3x3 game board
│   ├── GameCell.tsx           # Individual cell
│   └── GameStatus.tsx         # Status display
├── config/
│   └── firebase.ts            # Firebase configuration
├── hooks/
│   └── useGame.ts             # Game state management
├── services/
│   ├── firebase.ts            # Firebase operations
│   └── gameLogic.ts           # Game rules
├── types/
│   └── game.ts                # TypeScript types
└── utils/
    └── playerId.ts            # Player ID management
```

## Features

- ✅ Real-time multiplayer gameplay
- ✅ Create and join games
- ✅ Game ID sharing
- ✅ Win/draw detection
- ✅ Connection status monitoring
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Responsive design
- ✅ Error handling

## Next Steps

- Add authentication (Firebase Auth)
- Implement game history
- Add player profiles
- Create a matchmaking system
- Add sound effects and animations
- Implement rematch functionality
- Add chat between players

## License

MIT
