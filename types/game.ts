export type PlayerMark = 'X' | 'O';

export type CellValue = PlayerMark | null;

export type BoardState = [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];

export type GameStatus = 
  | 'waiting'      // Waiting for second player
  | 'active'       // Game in progress
  | 'finished'     // Game completed
  | 'abandoned';   // Player disconnected

export interface Player {
  id: string;
  mark: PlayerMark;
  connected: boolean;
  lastSeen: number; // timestamp
}

export interface GameSession {
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
