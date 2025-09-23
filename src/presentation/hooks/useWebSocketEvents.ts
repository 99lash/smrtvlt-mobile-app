import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENT_WS_URL } from '../../config/api';

interface UseWebSocketEventsProps {
  vaultId: number;
  prefixes: string[];
  token: string;
}

export interface WebSocketHook {
  lastJsonMessage: any;
  readyState: number; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
  sendMessage: (message: string) => void;
  sendJsonMessage: (message: object) => void;
  lastMessage?: string;
}

const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSING = 2;
const READY_STATE_CLOSED = 3;

export const useWebSocketEvents = ({ vaultId, prefixes, token }: UseWebSocketEventsProps): WebSocketHook | null => {
  // Internal token state
  const [internalToken, setInternalToken] = useState<string | null>(null);

  // Fetch token if not provided
  useEffect(() => {
    const fetchToken = async () => {
      if (!token || (token || '').trim() === '') {
        try {
          const storedToken = await AsyncStorage.getItem('access_token');
          console.log('Fetched token from storage for WS - exists:', !!storedToken);
          if (storedToken) {
            setInternalToken(storedToken);
          }
        } catch (err) {
          console.error('Error fetching token for WS:', err);
        }
      } else {
        setInternalToken(token);
      }
    };
    fetchToken();
  }, [token]);

  // Debug token immediately when hook is called
  console.log('=== WebSocket Hook Debug ===');
  console.log('Token received:', token);
  console.log('Token type:', typeof token);
  console.log('Token length:', token?.length || 0);
  console.log('Token is empty?', !token || (token || '').trim() === '');
  console.log('VaultId:', vaultId);
  console.log('Prefixes:', prefixes);
  console.log('========================');

  const [lastJsonMessage, setLastJsonMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(READY_STATE_CLOSED);
  const [lastMessage, setLastMessage] = useState<string | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectIntervalRef = useRef(1000); // Initial 1s

  const safeToken = useMemo(() => (internalToken || token || '').trim(), [internalToken, token]);
  const prefixesStr = useMemo(() => (prefixes || []).join(','), [prefixes]);
  const isValidToken = useMemo(() => !!safeToken, [safeToken]);
  const wsUrl = useMemo(() => {
    if (!isValidToken) return '';
    console.log('Constructing URL with token:', safeToken.substring(0, 10) + '...' + safeToken.substring(safeToken.length - 10));
    const url = new URL(EVENT_WS_URL);
    url.searchParams.append('token', safeToken);
    url.searchParams.append('vault_id', vaultId.toString());
    url.searchParams.append('prefixes', prefixesStr);
    const finalUrl = url.toString();
    console.log('Final WS URL (token masked):', finalUrl.replace(/token=[^&]*/, 'token=***MASKED***'));
    return finalUrl;
  }, [vaultId, prefixesStr, safeToken, isValidToken]);
  
  // Log the full URL before connect
  useEffect(() => {
    if (wsUrl) {
      console.log('Attempting WS connection to:', wsUrl.replace(/token=[^&]*/, 'token=***MASKED***'));
    }
  }, [wsUrl]);

  const connect = useCallback(() => {
    if (!isValidToken || !wsUrl) {
      console.warn('Cannot connect: Invalid token or URL');
      setReadyState(READY_STATE_CLOSED);
      return;
    }

    console.log('Connect called with token length:', safeToken.length);

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    setReadyState(READY_STATE_CONNECTING);

    ws.onopen = () => {
      console.log('WS connected, subscribing...');
      setReadyState(READY_STATE_OPEN);
      reconnectAttemptsRef.current = 0;
      reconnectIntervalRef.current = 1000;

      // Send subscribe message
      const subscribeMsg = { type: 'subscribe', vault_id: vaultId, prefixes: prefixes || [] };
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = (event) => {
      setLastMessage(event.data);
      try {
        const parsed = JSON.parse(event.data);
        setLastJsonMessage(parsed);
      } catch (e) {
        console.warn('Failed to parse WS message as JSON:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WS error:', error);
      setReadyState(READY_STATE_CLOSED);
    };

    ws.onclose = (event) => {
      console.log('WS closed:', event.code, event.reason);
      setReadyState(READY_STATE_CLOSED);
      setLastJsonMessage(null);
      setLastMessage(undefined);

      // Attempt reconnect only if valid token
      if (isValidToken && reconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000) {
        const interval = Math.min(reconnectIntervalRef.current * 2, 30000);
        reconnectIntervalRef.current = interval;
        reconnectAttemptsRef.current += 1;
        console.log(`Reconnecting in ${interval}ms (attempt ${reconnectAttemptsRef.current})`);
        setTimeout(connect, interval);
      }
    };
  }, [wsUrl, vaultId, prefixes, safeToken, isValidToken]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (!isValidToken || !wsRef.current || readyState !== READY_STATE_OPEN) {
      console.warn('Cannot send: Invalid token or WS not open');
      return;
    }
    wsRef.current.send(message);
  }, [readyState, isValidToken]);

  const sendJsonMessage = useCallback((message: object) => {
    sendMessage(JSON.stringify(message));
  }, [sendMessage]);

  if (!isValidToken) {
    return {
      lastJsonMessage: null,
      readyState: READY_STATE_CLOSED,
      sendMessage: () => console.warn('Cannot send: No valid token'),
      sendJsonMessage: () => console.warn('Cannot send: No valid token'),
      lastMessage: undefined,
    };
  }

  return {
    lastJsonMessage,
    readyState,
    sendMessage,
    sendJsonMessage,
    lastMessage,
  };
};