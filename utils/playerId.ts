import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_ID_KEY = '@tictactoe_player_id';

// Generate a simple UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getPlayerId(): Promise<string> {
  try {
    let playerId = await AsyncStorage.getItem(PLAYER_ID_KEY);
    
    if (!playerId) {
      playerId = generateUUID();
      await AsyncStorage.setItem(PLAYER_ID_KEY, playerId);
    }
    
    return playerId;
  } catch (error) {
    console.error('Error getting player ID:', error);
    // Fallback to generating a new ID if storage fails
    return generateUUID();
  }
}

export async function clearPlayerId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PLAYER_ID_KEY);
  } catch (error) {
    console.error('Error clearing player ID:', error);
  }
}
