import { GameBoard } from '@/components/GameBoard';
import { GameStatus } from '@/components/GameStatus';
import { useGame } from '@/hooks/useGame';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { game, loading, error, makeMove, leaveGame, isMyTurn, myMark, gameStatusMessage } =
    useGame(id);
  const [showGameOver, setShowGameOver] = useState(false);

  // Show game over modal when game finishes
  useEffect(() => {
    if (game?.status === 'finished' && !showGameOver) {
      setShowGameOver(true);
      setTimeout(() => {
        Alert.alert(
          'Game Over',
          game.winner === 'draw'
            ? 'Game ended in a draw!'
            : game.winner === myMark
            ? 'You won! 🎉'
            : 'You lost',
          [
            {
              text: 'Back to Lobby',
              onPress: handleLeaveGame,
            },
          ]
        );
      }, 500);
    }
  }, [game?.status, showGameOver]);

  const handleCellPress = async (index: number) => {
    if (!isMyTurn || game?.status !== 'active') {
      return;
    }

    // Debounce - prevent rapid clicks
    try {
      await makeMove(index);
    } catch (err) {
      Alert.alert('Error', 'Failed to make move');
    }
  };

  const handleLeaveGame = async () => {
    await leaveGame();
    router.replace('/');
  };

  if (loading && !game) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Game not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameId}>Game: {id?.substring(0, 8)}...</Text>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGame}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      <GameStatus
        status={game.status}
        isMyTurn={isMyTurn}
        winner={game.winner}
        myMark={myMark}
      />

      <View style={styles.boardContainer}>
        {game.board ? (
          <GameBoard
            board={game.board}
            onCellPress={handleCellPress}
            disabled={!isMyTurn || game.status !== 'active'}
          />
        ) : (
          <ActivityIndicator size="large" color="#3498db" />
        )}
      </View>

      {game.status === 'waiting' && (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.waitingText}>Waiting for opponent to join...</Text>
          <Text style={styles.shareText}>Share Game ID: {id}</Text>
        </View>
      )}

      {game.status === 'abandoned' && (
        <View style={styles.abandonedContainer}>
          <Text style={styles.abandonedText}>Opponent disconnected</Text>
          <TouchableOpacity style={styles.button} onPress={handleLeaveGame}>
            <Text style={styles.buttonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Connection indicator */}
      {game.players.player1 && game.players.player2 && (
        <View style={styles.connectionContainer}>
          <View style={styles.playerStatus}>
            <View
              style={[
                styles.connectionDot,
                game.players.player1.connected ? styles.connected : styles.disconnected,
              ]}
            />
            <Text style={styles.playerText}>Player 1 (X)</Text>
          </View>
          <View style={styles.playerStatus}>
            <View
              style={[
                styles.connectionDot,
                game.players.player2.connected ? styles.connected : styles.disconnected,
              ]}
            />
            <Text style={styles.playerText}>Player 2 (O)</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  gameId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  leaveButton: {
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  shareText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  abandonedContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  abandonedText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  playerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#27ae60',
  },
  disconnected: {
    backgroundColor: '#e74c3c',
  },
  playerText: {
    fontSize: 14,
    color: '#666',
  },
});
