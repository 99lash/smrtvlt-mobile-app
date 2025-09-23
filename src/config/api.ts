import AsyncStorage from '@react-native-async-storage/async-storage';

// --- BASE URL from .env or fallback ---
const BASE_URL = process.env.BASE_URL || 'http://192.168.1.8:8000'; // adjust per device setup
if (__DEV__) {
  console.log('Loaded BASE_URL from env:', process.env.BASE_URL);
}

// --- Fetch filtered logs ---
export interface LogEntry {
  id: number;
  message: string;
  prefix: string;
  created_at: string;
  // add other fields as needed
}

export const getFilteredLogs = async (
  vaultId: number,
  prefixes: string[] = ['DUAL', 'Tamper', 'Multifactor', 'Locked', 'Bruteforce'],
  offset: number = 0,
  limit: number = 50,
  token?: string
): Promise<LogEntry[]> => {
  let requestToken = token;

  // Fallback to AsyncStorage if token not provided
  if (!requestToken) {
    try {
      requestToken = (await AsyncStorage.getItem('access_token')) || undefined;
      if (__DEV__) {
        console.log('Fetched token from storage for API call - exists:', !!requestToken);
      }
    } catch (err) {
      console.error('Error fetching token from storage:', err);
    }
  }

  // Fail early if still no token
  if (!requestToken) {
    throw new Error('No access token available for API call');
  }

  // Build query
  const params = new URLSearchParams({
    prefixes: prefixes.join(','),
    offset: offset.toString(),
    limit: limit.toString(),
  });
  const url = `${BASE_URL}/logs/vault/${vaultId}/filtered?${params}`;

  if (__DEV__) {
    console.log('API Call - URL:', url);
    console.log('API Call - Token present:', !!requestToken, 'Length:', requestToken.length);
  }

  // Fetch
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${requestToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error - Status:', response.status, 'Body:', errorBody);
    throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
  }

  const data: LogEntry[] = await response.json();
  if (__DEV__) {
    console.log('API Success - Received logs count:', data.length);
  }
  return data;
};

// --- WebSocket URL for real-time events ---
const wsProtocol = BASE_URL.startsWith('https') ? 'wss://' : 'ws://';
const wsHost = BASE_URL.replace(/^https?:\/\//, '');
export const EVENT_WS_URL =
  process.env.EVENT_WS_URL || `${wsProtocol}${wsHost}/logs/ws`;

// --- Default query params ---
export const DEFAULT_QUERY_PARAMS = {
  vault_id: parseInt(process.env.DEFAULT_VAULT_ID || '2'),
  prefixes: (process.env.DEFAULT_PREFIXES || 'Locked,Tamper,DUAL,Failure').split(','),
} as const;

if (__DEV__) {
  console.log(
    'Loaded DEFAULT_VAULT_ID:',
    process.env.DEFAULT_VAULT_ID,
    'DEFAULT_PREFIXES:',
    process.env.DEFAULT_PREFIXES
  );
}

// --- Login function ---
export const login = async (username: string, password: string): Promise<string> => {
  const url = `${BASE_URL}/users/login`;
  const formData = new URLSearchParams({ username, password });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Login error:', response.status, errorText);
    throw new Error(`Login failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  try {
    await AsyncStorage.setItem('access_token', data.access_token);
  } catch (err) {
    console.error('Failed to store access_token:', err);
  }

  return data.access_token;
};
