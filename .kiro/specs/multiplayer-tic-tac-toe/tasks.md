# Implementation Plan: Multiplayer Tic-Tac-Toe (MVP)

## Overview

This implementation plan breaks down the multiplayer tic-tac-toe game into incremental tasks for a minimal viable product. The approach follows a bottom-up strategy: first implementing core game logic and data models, then Firebase integration, followed by UI components, and finally wiring everything together with the game screens.

## Tasks

- [x] 1. Set up Firebase configuration and install dependencies
  - Install Firebase SDK: `npx expo install firebase`
  - Create `config/firebase.ts` with Firebase initialization
  - Add Firebase config to environment variables or constants
  - Test Firebase connection on app startup
  - _Requirements: 7.1, 7.2_

- [x] 2. Implement core data models and types
  - Create `types/game.ts` with PlayerMark, CellValue, BoardState, GameStatus, Player, and GameSession types
  - Export all types for use across the app
  - _Requirements: 1.2, 2.3, 4.4_

- [x] 3. Implement game logic service
  - Create `services/gameLogic.ts` with createEmptyBoard, isValidMove, checkWinner, isBoardFull, and getNextTurn functions
  - Implement win detection for all 8 possible winning lines (3 horizontal, 3 vertical, 2 diagonal)
  - _Requirements: 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4_

- [x] 4. Implement Firebase service layer
  - Create `services/firebase.ts` with createGameSession, joinGameSession, updateGameMove, subscribeToGame, updatePlayerConnection, and getAvailableGames functions
  - Use Firebase Realtime Database references and listeners
  - Implement proper error handling for all Firebase operations
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 2.1, 6.2, 6.4, 7.4, 8.5_

- [x] 5. Implement player ID management
  - Create `utils/playerId.ts` with functions to generate, store, and retrieve player ID
  - Use AsyncStorage for persistence
  - Generate UUID or use Firebase anonymous auth
  - _Requirements: 6.4_

- [x] 6. Implement useGame hook
  - Create `hooks/useGame.ts` with state management and Firebase integration
  - Implement createGame, joinGame, makeMove, and leaveGame functions
  - Add computed properties: isMyTurn, myMark, gameStatusMessage
  - Subscribe to Firebase game updates and sync local state
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement UI components
  - [x] 7.1 Create GameCell component
    - Create `components/GameCell.tsx` with cell rendering and press handling
    - Style for X, O, and empty states
    - Add winning cell highlight styling
    - Support both touch and mouse input
    - _Requirements: 3.1, 9.4, 9.5_
  
  - [x] 7.2 Create GameBoard component
    - Create `components/GameBoard.tsx` with 3x3 grid layout
    - Render 9 GameCell components
    - Handle cell press events and pass to parent
    - Highlight winning line when game is won
    - _Requirements: 3.1, 9.1, 9.2, 9.3_
  
  - [x] 7.3 Create GameStatus component
    - Create `components/GameStatus.tsx` to display game status messages
    - Show appropriate message based on game state (waiting, your turn, opponent's turn, winner, draw)
    - Style for different status types
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Implement Lobby screen
  - [x] 8.1 Create lobby screen UI
    - Create `app/(tabs)/lobby.tsx` or update existing screen
    - Add "Create Game" button
    - Add "Join Game" button with text input for game ID
    - Display list of available games
    - Show loading states during operations
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [x] 8.2 Wire lobby screen to useGame hook
    - Connect Create Game button to createGame function
    - Connect Join Game button to joinGame function
    - Display created game ID for sharing
    - Navigate to game board on successful join
    - Handle errors and display user-friendly messages
    - _Requirements: 1.1, 1.3, 8.3, 8.4_

- [x] 9. Implement Game Board screen
  - [x] 9.1 Create game board screen UI
    - Create `app/game/[id].tsx` for dynamic game route
    - Integrate GameBoard and GameStatus components
    - Display player marks (You are X/O)
    - Add "Leave Game" button
    - Show connection status indicator
    - _Requirements: 2.2, 3.1, 5.1, 5.2, 5.3_
  
  - [x] 9.2 Wire game board screen to useGame hook
    - Load game using game ID from route params
    - Connect cell press to makeMove function
    - Display real-time board updates
    - Handle game completion (winner/draw)
    - Implement optimistic UI updates with rollback
    - _Requirements: 2.1, 2.2, 3.1, 3.4, 4.5_
  
  - [x] 9.3 Implement connection monitoring
    - Use Firebase connection state monitoring
    - Update player lastSeen timestamp
    - Display connection lost message
    - Handle reconnection and state restoration
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 10. Implement Game Over screen or modal
  - [x] 10.1 Create game over UI
    - Create game over modal or screen component
    - Display final game result (winner or draw)
    - Add "Play Again" button (creates new game)
    - Add "Back to Lobby" button
    - _Requirements: 5.4, 5.5_
  
  - [x] 10.2 Wire game over UI
    - Show modal/screen when game status is "finished"
    - Connect "Play Again" to createGame
    - Connect "Back to Lobby" to navigation
    - _Requirements: 4.5, 5.4, 5.5_

- [x] 11. Add navigation and routing
  - Update `app/_layout.tsx` to include game routes
  - Add lobby tab or screen to tab navigator
  - Configure dynamic route for game board
  - Ensure proper navigation flow: Lobby → Game Board → Game Over → Lobby
  - _Requirements: 8.4_

- [x] 12. Implement error handling and edge cases
  - Wrap all Firebase operations in try-catch
  - Display user-friendly error messages
  - Implement retry mechanisms for failed operations
  - Handle invalid game IDs gracefully
  - Debounce cell press events (300ms)
  - Validate board structure on load
  - _Requirements: 1.4, 3.2, 3.3_

- [x] 13. Add loading and connection states
  - Show loading spinner during game creation
  - Show loading spinner during game join
  - Show loading spinner during move submission
  - Disable board interaction while processing
  - _Requirements: 2.1, 5.1_

- [x] 14. Polish and final touches
  - [x] 14.1 Add styling and animations
    - Style all components with consistent theme
    - Add animations for cell placement
    - Add animations for winning line
    - Ensure responsive layout for different screen sizes
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 14.2 Add accessibility features
    - Add accessibility labels to buttons and cells
    - Ensure proper focus management
    - Test with screen readers
    - _Requirements: 9.1, 9.2, 9.3_

## Notes

- This is an MVP implementation plan with all testing tasks removed
- Each task references specific requirements for traceability
- Focus on getting core functionality working first
- Polish and accessibility can be enhanced after MVP is complete
