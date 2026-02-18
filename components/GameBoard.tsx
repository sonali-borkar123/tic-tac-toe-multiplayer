import { BoardState } from '@/types/game';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GameCell } from './GameCell';

interface GameBoardProps {
  board: BoardState;
  onCellPress: (index: number) => void;
  disabled: boolean;
  winningLine?: number[];
}

export function GameBoard({ board, onCellPress, disabled, winningLine = [] }: GameBoardProps) {
  // Safety check for board
  if (!board || !Array.isArray(board) || board.length !== 9) {
    return (
      <View style={styles.board}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const renderRow = (startIndex: number) => {
    return (
      <View style={styles.row}>
        {[0, 1, 2].map((offset) => {
          const index = startIndex + offset;
          return (
            <GameCell
              key={index}
              value={board[index]}
              onPress={() => onCellPress(index)}
              disabled={disabled}
              isWinning={winningLine.includes(index)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.board}>
      {renderRow(0)}
      {renderRow(3)}
      {renderRow(6)}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
