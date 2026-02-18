import { GameStatus as GameStatusType, PlayerMark } from '@/types/game';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GameStatusProps {
  status: GameStatusType;
  isMyTurn: boolean;
  winner: PlayerMark | 'draw' | null;
  myMark: PlayerMark | null;
}

export function GameStatus({ status, isMyTurn, winner, myMark }: GameStatusProps) {
  const getMessage = () => {
    if (status === 'waiting') {
      return 'Waiting for opponent...';
    }

    if (status === 'finished') {
      if (winner === 'draw') {
        return 'Game ended in a draw';
      }
      if (winner === myMark) {
        return 'You won! 🎉';
      }
      return 'You lost';
    }

    if (status === 'abandoned') {
      return 'Opponent disconnected';
    }

    if (isMyTurn) {
      return `Your turn (${myMark})`;
    }

    return "Opponent's turn";
  };

  const getStatusStyle = () => {
    if (status === 'finished' && winner === myMark) {
      return styles.winStatus;
    }
    if (status === 'finished' && winner !== 'draw') {
      return styles.loseStatus;
    }
    if (isMyTurn) {
      return styles.yourTurnStatus;
    }
    return styles.defaultStatus;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, getStatusStyle()]}>{getMessage()}</Text>
      {myMark && status === 'active' && (
        <Text style={styles.markText}>You are {myMark}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  markText: {
    fontSize: 16,
    marginTop: 8,
    color: '#666',
  },
  defaultStatus: {
    color: '#333',
  },
  yourTurnStatus: {
    color: '#27ae60',
  },
  winStatus: {
    color: '#27ae60',
  },
  loseStatus: {
    color: '#e74c3c',
  },
});
