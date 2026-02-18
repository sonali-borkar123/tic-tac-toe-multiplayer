import { BoardState, PlayerMark } from '@/types/game';

export function createEmptyBoard(): BoardState {
  return [null, null, null, null, null, null, null, null, null];
}

export function isValidMove(
  board: BoardState,
  cellIndex: number,
  currentTurn: PlayerMark,
  playerMark: PlayerMark
): boolean {
  // Check if index is valid
  if (cellIndex < 0 || cellIndex > 8) {
    return false;
  }

  // Check if it's the player's turn
  if (currentTurn !== playerMark) {
    return false;
  }

  // Check if cell is empty
  if (board[cellIndex] !== null) {
    return false;
  }

  return true;
}

export function checkWinner(board: BoardState): PlayerMark | 'draw' | null {
  // All possible winning lines (3 horizontal, 3 vertical, 2 diagonal)
  const winningLines = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
  ];

  // Check each winning line
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as PlayerMark;
    }
  }

  // Check for draw (board full with no winner)
  if (isBoardFull(board)) {
    return 'draw';
  }

  // Game still in progress
  return null;
}

export function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

export function getNextTurn(currentTurn: PlayerMark): PlayerMark {
  return currentTurn === 'X' ? 'O' : 'X';
}
