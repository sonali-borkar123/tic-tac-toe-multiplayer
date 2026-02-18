import {
    createGameSession,
    joinGameSession,
    subscribeToGame,
    updateGameMove,
    updatePlayerConnection,
} from '@/services/firebase';
import { isValidMove } from '@/services/gameLogic';
import { GameSession, PlayerMark } from '@/types/game';
import { getPlayerId } from '@/utils/playerId';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseGameReturn {
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  createGame: () => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
  makeMove: (cellIndex: number) => Promise<void>;
  leaveGame: () => Promise<void>;
  isMyTurn: boolean;
  myMark: PlayerMark | null;
  gameStatusMessage: string;
}

export function useGame(gameId?: string): UseGameReturn {
  const [game, setGame] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Get player ID on mount
  useEffect(() => {
    getPlayerId().then(setPlayerId);
  }, []);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameId) {
      return;
    }

    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  // Update connection status
  useEffect(() => {
    if (!gameId || !playerId) {
      return;
    }

    updatePlayerConnection(gameId, playerId, true);

    return () => {
      updatePlayerConnection(gameId, playerId, false);
    };
  }, [gameId, playerId]);

  const createGame = useCallback(async (): Promise<string> => {
    if (!playerId) {
      throw new Error('Player ID not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const newGameId = await createGameSession(playerId);
      return newGameId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const joinGame = useCallback(
    async (gameIdToJoin: string): Promise<void> => {
      if (!playerId) {
        throw new Error('Player ID not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        await joinGameSession(gameIdToJoin, playerId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [playerId]
  );

  const makeMove = useCallback(
    async (cellIndex: number): Promise<void> => {
      if (!game || !playerId) {
        return;
      }

      // Get player mark
      const playerMark = game && playerId
        ? game.players.player1?.id === playerId
          ? game.players.player1.mark
          : game.players.player2?.id === playerId
          ? game.players.player2.mark
          : null
        : null;

      if (!playerMark) {
        setError('You are not a player in this game');
        return;
      }

      // Validate move
      if (!isValidMove(game.board, cellIndex, game.currentTurn, playerMark)) {
        setError('Invalid move');
        setTimeout(() => setError(null), 2000);
        return;
      }

      setError(null);

      try {
        await updateGameMove(game.id, cellIndex, playerMark, game.board);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to make move';
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
      }
    },
    [game, playerId]
  );

  const leaveGame = useCallback(async (): Promise<void> => {
    if (!gameId || !playerId) {
      return;
    }

    try {
      await updatePlayerConnection(gameId, playerId, false);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      setGame(null);
    } catch (err) {
      console.error('Error leaving game:', err);
    }
  }, [gameId, playerId]);

  // Computed properties
  const myMark = game && playerId
    ? game.players.player1?.id === playerId
      ? game.players.player1.mark
      : game.players.player2?.id === playerId
      ? game.players.player2.mark
      : null
    : null;

  const isMyTurn = game && myMark ? game.currentTurn === myMark && game.status === 'active' : false;

  const gameStatusMessage = (() => {
    if (!game) {
      return '';
    }

    if (game.status === 'waiting') {
      return 'Waiting for opponent...';
    }

    if (game.status === 'finished') {
      if (game.winner === 'draw') {
        return 'Game ended in a draw';
      }
      if (game.winner === myMark) {
        return 'You won!';
      }
      return 'You lost';
    }

    if (game.status === 'abandoned') {
      return 'Opponent disconnected';
    }

    if (isMyTurn) {
      return 'Your turn';
    }

    return "Opponent's turn";
  })();

  return {
    game,
    loading,
    error,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
    isMyTurn,
    myMark,
    gameStatusMessage,
  };
}
