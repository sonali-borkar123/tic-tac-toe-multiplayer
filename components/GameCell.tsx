import { CellValue } from '@/types/game';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface GameCellProps {
  value: CellValue;
  onPress: () => void;
  disabled: boolean;
  isWinning: boolean;
}

export function GameCell({ value, onPress, disabled, isWinning }: GameCellProps) {
  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isWinning && styles.winningCell,
        disabled && styles.disabledCell,
      ]}
      onPress={onPress}
      disabled={disabled || value !== null}
      accessibilityLabel={`Cell ${value || 'empty'}`}
      accessibilityRole="button"
    >
      <Text style={[styles.cellText, value === 'X' ? styles.xText : styles.oText]}>
        {value || ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  cellText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  xText: {
    color: '#e74c3c',
  },
  oText: {
    color: '#3498db',
  },
  winningCell: {
    backgroundColor: '#f1c40f',
  },
  disabledCell: {
    opacity: 0.6,
  },
});
