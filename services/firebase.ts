import { getFirebaseDatabase } from '@/config/firebase';
import { BoardState, GameSession, PlayerMark } from '@/types/game';
import {
  get,
  onValue,
  push,
  ref,
  set,
  Unsubscribe,
  update
} from 'firebase/database';
import { checkWinner, createEmptyBoard, getNextTurn } from './gameLogic';

const database = getFirebaseDatabase();

export async function createGameSession(playerId: string): Promise<string> {
  try {
    const gamesRef = ref(database, 'games');
    const newGameRef = push(gamesRef);
    const gameId = newGameRef.key;

    if (!gameId) {
      throw new Error('Failed to generate game ID');
    }

    const now = Date.now();
    const gameSession: GameSession = {
      id: gameId,
      board: createEmptyBoard(),
      players: {
        player1: {
          id: playerId,
          mark: 'X',
          connected: true,
          lastSeen: now,
        },
        player2: null,
      },
      currentTurn: 'X',
      status: 'waiting',
      winner: null,
      createdAt: now,
      updatedAt: now,
    };

    await set(newGameRef, gameSession);
    return gameId;
  } catch (error) {
    console.error('Error creating game session:', error);
    throw new Error('Failed to create game session');
  }
}

export async function joinGameSession(
  gameId: string,
  playerId: string
): Promise<void> {
  try {
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      throw new Error('Game not found');
    }

    const game = snapshot.val() as GameSession;

    // Check if players object exists
    if (!game.players) {
      throw new Error('Invalid game data');
    }

    // Check if game already has two players
    if (game.players.player2 !== null && game.players.player2 !== undefined) {
      throw new Error('Game is full');
    }

    // Check if player is already player1
    if (game.players.player1?.id === playerId) {
      throw new Error('You are already in this game');
    }

    const now = Date.now();
    const updates: any = {
      'players/player2': {
        id: playerId,
        mark: 'O',
        connected: true,
        lastSeen: now,
      },
      status: 'active',
      updatedAt: now,
    };

    // Ensure board exists
    if (!game.board) {
      updates.board = createEmptyBoard();
    }

    await update(gameRef, updates);
  } catch (error) {
    console.error('Error joining game session:', error);
    throw error;
  }
}

export async function updateGameMove(
  gameId: string,
  cellIndex: number,
  playerMark: PlayerMark,
  board: BoardState
): Promise<void> {
  try {
    const gameRef = ref(database, `games/${gameId}`);
    const now = Date.now();

    // Update board with the new move
    const newBoard = [...board] as BoardState;
    newBoard[cellIndex] = playerMark;

    // Check for winner or draw
    const winner = checkWinner(newBoard);
    const nextTurn = getNextTurn(playerMark);

    const updates: any = {
      board: newBoard,
      currentTurn: nextTurn,
      updatedAt: now,
    };

    // If game is finished, update status and winner
    if (winner) {
      updates.status = 'finished';
      updates.winner = winner;
    }

    await update(gameRef, updates);
  } catch (error) {
    console.error('Error updating game move:', error);
    throw new Error('Failed to update move');
  }
}

export function subscribeToGame(
  gameId: string,
  callback: (game: GameSession | null) => void
): Unsubscribe {
  const gameRef = ref(database, `games/${gameId}`);

  return onValue(
    gameRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as GameSession);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to game:', error);
      callback(null);
    }
  );
}

export async function updatePlayerConnection(
  gameId: string,
  playerId: string,
  connected: boolean
): Promise<void> {
  try {
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      return;
    }

    const game = snapshot.val() as GameSession;
    const now = Date.now();
    let updates: any = {};

    if (game.players.player1?.id === playerId) {
      updates['players/player1/connected'] = connected;
      updates['players/player1/lastSeen'] = now;
    } else if (game.players.player2?.id === playerId) {
      updates['players/player2/connected'] = connected;
      updates['players/player2/lastSeen'] = now;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = now;
      await update(gameRef, updates);
    }
  } catch (error) {
    console.error('Error updating player connection:', error);
  }
}

export async function getAvailableGames(): Promise<GameSession[]> {
  try {
    const gamesRef = ref(database, 'games');
    const snapshot = await get(gamesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const games: GameSession[] = [];
    snapshot.forEach((childSnapshot) => {
      const game = childSnapshot.val() as GameSession;
      // Filter for waiting games on the client side
      if (game.status === 'waiting') {
        games.push(game);
      }
    });

    return games;
  } catch (error) {
    console.error('Error getting available games:', error);
    return [];
  }
}
