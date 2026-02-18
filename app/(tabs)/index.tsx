import { initializeFirebase } from '@/config/firebase';
import { useGame } from '@/hooks/useGame';
import { getAvailableGames } from '@/services/firebase';
import { GameSession } from '@/types/game';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LobbyScreen() {
  const [gameIdInput, setGameIdInput] = useState('');
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const { createGame, joinGame, loading, error } = useGame();
  const router = useRouter();

  // Initialize Firebase on mount
  useEffect(() => {
    initializeFirebase();
  }, []);

  // Load available games
  const loadAvailableGames = async () => {
    setLoadingGames(true);
    try {
      const games = await getAvailableGames();
      setAvailableGames(games);
    } catch (err) {
      console.error('Error loading games:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    loadAvailableGames();
    const interval = setInterval(loadAvailableGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateGame = async () => {
    try {
      const gameId = await createGame();
      Alert.alert(
        'Game Created!',
        `Game ID: ${gameId}\n\nShare this ID with your opponent to join.`,
        [
          {
            text: 'OK',
            onPress: () => router.push(`/game/${gameId}` as any),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to create game');
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (!gameId.trim()) {
      Alert.alert('Error', 'Please enter a game ID');
      return;
    }

    try {
      await joinGame(gameId);
      router.push(`/game/${gameId}` as any);
    } catch (err) {
      Alert.alert('Error', error || 'Failed to join game');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Multiplayer Tic-Tac-Toe</Text>

        {/* Create Game Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreateGame}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create New Game</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Join Game Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Game</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Game ID"
            value={gameIdInput}
            onChangeText={setGameIdInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={() => handleJoinGame(gameIdInput)}
            disabled={loading || !gameIdInput.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Join Game</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Available Games Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Games</Text>
          {loadingGames ? (
            <ActivityIndicator size="large" color="#3498db" />
          ) : availableGames.length === 0 ? (
            <Text style={styles.emptyText}>No games available</Text>
          ) : (
            availableGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameItem}
                onPress={() => handleJoinGame(game.id)}
              >
                <Text style={styles.gameId}>Game: {game.id.substring(0, 8)}...</Text>
                <Text style={styles.gameStatus}>Waiting for player</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  createButton: {
    backgroundColor: '#27ae60',
  },
  joinButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  gameItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  gameId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});
