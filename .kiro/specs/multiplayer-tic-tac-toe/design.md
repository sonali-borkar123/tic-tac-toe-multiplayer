# Design Document: Multiplayer Tic-Tac-Toe

## Overview

This design describes a multiplayer tic-tac-toe game built with React Native (Expo) and Firebase. The architecture follows a client-server model where Firebase acts as the backend, handling real-time data synchronization between players. The app uses Expo Router for navigation, React hooks for state management, and Firebase Realtime Database for game state persistence and synchronization.

The game flow consists of three main screens:
1. **Lobby Screen**: Create or join games
2. **Game Board Screen**: Play the game with real-time updates
3. **Game Over Screen**: Display results and offer rematch/new game options

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Lobby     │  │  Game Board  │  │  Game Over   │      │
│  │    Screen    │  │    Screen    │  │    Screen    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Game Service   │                        │
│                   │   (Hooks/API)   │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │ Firebase Client │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │     Firebase    │
                    │ Realtime Database│
                    └─────────────────┘
```

### Technology Stack

- **Frontend**: React Native 0.81.5, React 19.1.0, Expo ~54
- **Navigation**: Expo Router ~6.0
- **Backend**: Firebase Realtime Database
- **Language**: TypeScript ~5.9
- **State Management**: React hooks (useState, useEffect)
- **Real-time Sync**: Firebase listeners

## Components and Interfaces

### Firebase Configuration

**File**: `config/firebase.ts`

```typescript
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Initialize Firebase with Expo-compatible configuration
function initializeFirebase(config: FirebaseConfig): FirebaseApp;
function getDatabase(): Database;
```

### Data Models

**File**: `types/game.ts`

```typescript
type PlayerMark = 'X' | 'O';
type CellValue = PlayerMark | null;
type BoardState = [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];

type GameStatus = 
  | 'waiting'      // Waiting for second player
  | 'active'       // Game in progress
  | 'finished'     // Game completed
  | 'abandoned';   // Player disconnected

interface Player {
  id: string;
  mark: PlayerMark;
  connected: boolean;
  lastSeen: number; // timestamp
}

interface GameSession {
  id: string;
  board: BoardState;
  players: {
    player1: Player | null;
    player2: Player | null;
  };
  currentTurn: PlayerMark;
  status: GameStatus;
  winner: PlayerMark | 'draw' | null;
  createdAt: number;
  updatedAt: number;
}
```

### Game Service Hook

**File**: `hooks/useGame.ts`

```typescript
interface UseGameReturn {
  // State
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createGame: () => Promise<string>; // Returns game ID
  joinGame: (gameId: string) => Promise<void>;
  makeMove: (cellIndex: number) => Promise<void>;
  leaveGame: () => Promise<void>;
  
  // Computed
  isMyTurn: boolean;
  myMark: PlayerMark | null;
  gameStatusMessage: string;
}

function useGame(gameId?: string): UseGameReturn;
```

### Game Logic Service

**File**: `services/gameLogic.ts`

```typescript
// Check if a move is valid
function isValidMove(
  board: BoardState, 
  cellIndex: number, 
  currentTurn: PlayerMark,
  playerMark: PlayerMark
): boolean;

// Check for winner after a move
function checkWinner(board: BoardState): PlayerMark | 'draw' | null;

// Check if board is full
function isBoardFull(board: BoardState): boolean;

// Get next turn
function getNextTurn(currentTurn: PlayerMark): PlayerMark;

// Initialize empty board
function createEmptyBoard(): BoardState;
```

### Firebase Service

**File**: `services/firebase.ts`

```typescript
// Create a new game session
function createGameSession(playerId: string): Promise<string>;

// Join an existing game session
function joinGameSession(gameId: string, playerId: string): Promise<void>;

// Make a move
function updateGameMove(
  gameId: string, 
  cellIndex: number, 
  playerMark: PlayerMark
): Promise<void>;

// Subscribe to game updates
function subscribeToGame(
  gameId: string, 
  callback: (game: GameSession) => void
): () => void; // Returns unsubscribe function

// Update player connection status
function updatePlayerConnection(
  gameId: string, 
  playerId: string, 
  connected: boolean
): Promise<void>;

// Get available games
function getAvailableGames(): Promise<GameSession[]>;
```

### UI Components

**File**: `components/GameBoard.tsx`

```typescript
interface GameBoardProps {
  board: BoardState;
  onCellPress: (index: number) => void;
  disabled: boolean;
  winningLine?: number[]; // Indices of winning cells
}

function GameBoard(props: GameBoardProps): JSX.Element;
```

**File**: `components/GameCell.tsx`

```typescript
interface GameCellProps {
  value: CellValue;
  onPress: () => void;
  disabled: boolean;
  isWinning: boolean;
}

function GameCell(props: GameCellProps): JSX.Element;
```

**File**: `components/GameStatus.tsx`

```typescript
interface GameStatusProps {
  status: GameStatus;
  isMyTurn: boolean;
  winner: PlayerMark | 'draw' | null;
  myMark: PlayerMark | null;
}

function GameStatus(props: GameStatusProps): JSX.Element;
```

## Data Models

### Firebase Database Structure

```
games/
  {gameId}/
    id: string
    board: array[9]
    players/
      player1/
        id: string
        mark: "X" | "O"
        connected: boolean
        lastSeen: timestamp
      player2/
        id: string
        mark: "X" | "O"
        connected: boolean
        lastSeen: timestamp
    currentTurn: "X" | "O"
    status: "waiting" | "active" | "finished" | "abandoned"
    winner: "X" | "O" | "draw" | null
    createdAt: timestamp
    updatedAt: timestamp
```

### Local State Management

Each screen maintains minimal local state, relying primarily on Firebase for source of truth:

- **Lobby Screen**: List of available games, loading states
- **Game Board Screen**: Optimistic UI updates (immediately show move, rollback on error)
- **Connection State**: Player ID stored in AsyncStorage for reconnection

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Unique Game IDs
*For any* set of game creation requests, all generated game IDs should be unique and non-empty.
**Validates: Requirements 1.1**

### Property 2: Empty Board Initialization
*For any* newly created game session, the board should contain exactly 9 cells, all with null values.
**Validates: Requirements 1.2**

### Property 3: Join Logic for Available Games
*For any* game session with exactly one player and status "waiting", a join request should successfully add a second player.
**Validates: Requirements 1.3**

### Property 4: Full Game Join Rejection
*For any* game session with two players already present, a join request should be rejected and the game state should remain unchanged.
**Validates: Requirements 1.4**

### Property 5: Distinct Player Marks
*For any* game session after a second player joins, both players should have different marks (one X, one O), and both marks should be valid.
**Validates: Requirements 1.5**

### Property 6: Game Activation on Second Player
*For any* game session in "waiting" status, when a second player joins, the status should transition to "active".
**Validates: Requirements 1.6**

### Property 7: Turn Alternation
*For any* valid move on an active game, the current turn should switch from X to O or from O to X.
**Validates: Requirements 2.3, 3.4**

### Property 8: Winner Synchronization
*For any* board state that contains a winning configuration (three identical marks in a row), the game winner field should be set to the corresponding player mark.
**Validates: Requirements 2.4**

### Property 9: Draw Synchronization
*For any* board state where all cells are filled and no winning configuration exists, the game winner field should be set to "draw".
**Validates: Requirements 2.5, 4.4**

### Property 10: Valid Move Placement
*For any* game state where it is a player's turn and they select an empty cell, the cell should be filled with that player's mark.
**Validates: Requirements 3.1**

### Property 11: Occupied Cell Rejection
*For any* board state and any occupied cell, attempting to place a mark in that cell should leave the board unchanged.
**Validates: Requirements 3.2**

### Property 12: Wrong Turn Rejection
*For any* game state where it is not a player's turn, their move attempt should be rejected and the board should remain unchanged.
**Validates: Requirements 3.3**

### Property 13: Win Detection for All Configurations
*For any* board state containing three identical marks in a horizontal, vertical, or diagonal line, the checkWinner function should return the corresponding player mark.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 14: Finished Game Move Prevention
*For any* game session with status "finished", all move attempts should be rejected and the board should remain unchanged.
**Validates: Requirements 4.5**

### Property 15: Status Message Correctness
*For any* game state (waiting, active with turn, finished with winner/draw), the status message function should return the appropriate message string corresponding to that state.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 16: Disconnection Status Update
*For any* game session where a player disconnection is detected, the game status should be updated to reflect the disconnection.
**Validates: Requirements 6.2**

### Property 17: Session Restoration
*For any* game session that was disconnected, reconnecting with the same game ID should restore the exact board state that existed at disconnection.
**Validates: Requirements 6.4**

### Property 18: Timestamp Presence
*For any* game session stored in the database, the createdAt and updatedAt timestamp fields should be present and valid.
**Validates: Requirements 7.4**

### Property 19: Game ID Display After Creation
*For any* successful game creation, the returned game ID should be non-empty and suitable for sharing with another player.
**Validates: Requirements 8.3**

### Property 20: Available Games Query
*For any* query for available games, all returned game sessions should have status "waiting" and exactly one player.
**Validates: Requirements 8.5**

## Error Handling

### Network Errors

**Connection Loss During Game**:
- Implement exponential backoff for reconnection attempts
- Display connection status indicator to user
- Queue moves locally and sync when connection restored
- Timeout after 10 seconds and show "Connection lost" message

**Firebase Operation Failures**:
- Wrap all Firebase operations in try-catch blocks
- Display user-friendly error messages
- Log errors for debugging
- Provide retry mechanisms for failed operations

### Invalid Game States

**Corrupted Board Data**:
- Validate board structure on load (must be array of 9 cells)
- Reset to empty board if validation fails
- Log corruption for investigation

**Missing Player Data**:
- Check for null players before operations
- Handle edge case where player data is incomplete
- Provide default values where safe

**Race Conditions**:
- Use Firebase transactions for critical operations (move placement, player joining)
- Implement optimistic UI updates with rollback on conflict
- Add version numbers to game state for conflict detection

### User Input Errors

**Invalid Game ID**:
- Validate game ID format before attempting to join
- Display "Game not found" for non-existent IDs
- Suggest creating a new game instead

**Rapid Repeated Moves**:
- Debounce cell press events (300ms)
- Disable board interaction while move is processing
- Show loading indicator during move submission

## Testing Strategy

### Unit Testing

Unit tests will focus on specific examples, edge cases, and error conditions:

**Game Logic Tests** (`services/gameLogic.test.ts`):
- Test specific winning configurations (horizontal row 0, vertical column 1, diagonal, etc.)
- Test draw detection with specific full board configurations
- Test empty board creation
- Test turn switching for specific sequences
- Test edge cases: empty board, single move, full board

**Firebase Service Tests** (`services/firebase.test.ts`):
- Mock Firebase SDK
- Test game creation returns valid ID
- Test join game with valid/invalid IDs
- Test move update with valid/invalid data
- Test error handling for network failures

**Component Tests**:
- Test GameBoard renders 9 cells
- Test GameCell displays correct mark (X, O, empty)
- Test GameStatus displays correct message for specific states
- Test button press handlers are called

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using a PBT library. Each test will run a minimum of 100 iterations with randomized inputs.

**Library**: Use `fast-check` for TypeScript property-based testing

**Configuration**:
```typescript
import fc from 'fast-check';

// Example configuration
fc.assert(
  fc.property(
    fc.array(fc.integer(0, 8), { minLength: 9, maxLength: 9 }),
    (board) => {
      // Property test implementation
    }
  ),
  { numRuns: 100 }
);
```

**Property Test Files**:

`services/gameLogic.property.test.ts`:
- **Feature: multiplayer-tic-tac-toe, Property 2**: Empty Board Initialization
- **Feature: multiplayer-tic-tac-toe, Property 7**: Turn Alternation
- **Feature: multiplayer-tic-tac-toe, Property 8**: Winner Synchronization
- **Feature: multiplayer-tic-tac-toe, Property 9**: Draw Synchronization
- **Feature: multiplayer-tic-tac-toe, Property 10**: Valid Move Placement
- **Feature: multiplayer-tic-tac-toe, Property 11**: Occupied Cell Rejection
- **Feature: multiplayer-tic-tac-toe, Property 13**: Win Detection for All Configurations
- **Feature: multiplayer-tic-tac-toe, Property 14**: Finished Game Move Prevention

`services/firebase.property.test.ts`:
- **Feature: multiplayer-tic-tac-toe, Property 1**: Unique Game IDs
- **Feature: multiplayer-tic-tac-toe, Property 3**: Join Logic for Available Games
- **Feature: multiplayer-tic-tac-toe, Property 4**: Full Game Join Rejection
- **Feature: multiplayer-tic-tac-toe, Property 5**: Distinct Player Marks
- **Feature: multiplayer-tic-tac-toe, Property 6**: Game Activation on Second Player
- **Feature: multiplayer-tic-tac-toe, Property 18**: Timestamp Presence
- **Feature: multiplayer-tic-tac-toe, Property 19**: Game ID Display After Creation
- **Feature: multiplayer-tic-tac-toe, Property 20**: Available Games Query

`hooks/useGame.property.test.ts`:
- **Feature: multiplayer-tic-tac-toe, Property 12**: Wrong Turn Rejection
- **Feature: multiplayer-tic-tac-toe, Property 15**: Status Message Correctness
- **Feature: multiplayer-tic-tac-toe, Property 16**: Disconnection Status Update
- **Feature: multiplayer-tic-tac-toe, Property 17**: Session Restoration

### Integration Testing

**End-to-End Game Flow**:
- Create game → Join game → Play moves → Detect winner
- Test with Firebase emulator for consistent environment
- Verify real-time synchronization between two simulated clients

**Cross-Platform Testing**:
- Test on iOS simulator
- Test on Android emulator
- Test in web browser (Chrome, Safari, Firefox)
- Verify touch and mouse input handling

### Testing Balance

- Unit tests provide concrete examples and catch specific bugs
- Property tests verify correctness across all possible inputs
- Integration tests ensure components work together correctly
- Both unit and property tests are necessary for comprehensive coverage
- Property tests handle the heavy lifting of input coverage (100+ iterations)
- Unit tests focus on critical examples and edge cases

## Implementation Notes

### Firebase Setup

1. Create Firebase project in Firebase Console
2. Enable Realtime Database with appropriate security rules
3. Add Firebase configuration to Expo app using environment variables
4. Install Firebase SDK: `npx expo install firebase`

### Security Rules

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": "!data.exists() || data.child('players').child('player1').child('id').val() == auth.uid || data.child('players').child('player2').child('id').val() == auth.uid"
      }
    }
  }
}
```

### Player ID Generation

Use a simple UUID or Firebase anonymous authentication for player identification. Store player ID in AsyncStorage for reconnection support.

### Optimistic UI Updates

When a player makes a move:
1. Immediately update local state (optimistic)
2. Submit move to Firebase
3. If Firebase rejects (conflict), rollback local state
4. If Firebase accepts, local state already matches

This provides instant feedback while maintaining consistency.

### Connection Monitoring

Use Firebase's connection state monitoring:
```typescript
const connectedRef = ref(database, '.info/connected');
onValue(connectedRef, (snapshot) => {
  if (snapshot.val() === true) {
    // Connected
  } else {
    // Disconnected
  }
});
```

Update player's `lastSeen` timestamp on connection changes.
