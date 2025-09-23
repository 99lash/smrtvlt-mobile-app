import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogEntry } from '../../types/ActivityTypes';
import { getFilteredLogs, EVENT_WS_URL, DEFAULT_QUERY_PARAMS } from '../../config/api';
import { useWebSocketEvents } from './useWebSocketEvents';

interface UseActivityLogsProps {
  vaultId: number;
  initialPrefixes: string[];
}

export const useActivityLogs = ({ vaultId, initialPrefixes }: UseActivityLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fallbackTimeout, setFallbackTimeout] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isInitialLoadRef = useRef(true);
  const LIMIT = 50;
  const POLL_INTERVAL = 120000; // 2 minutes for rare fallback
  const DISCONNECT_TIMEOUT = 120000; // Trigger fallback after 2min disconnect

  // Initial load and refresh with HTTP
  const fetchLogs = useCallback(async (newOffset = 0) => {
    if (loading) return; // Prevent concurrent fetches
    setLoading(true);
    console.log('FetchLogs called - VaultId:', vaultId, 'Offset:', newOffset, 'Prefixes:', initialPrefixes);
    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('Token retrieved in fetchLogs - exists:', !!token);
      if (token) {
        console.log('Token details in fetchLogs - length:', token.length, 'starts with:', token.substring(0, 10) + '...');
      } else {
        console.log('Token value in fetchLogs: null');
      }
      if (!token) {
        console.warn('No auth token found; proceeding without auth (endpoint is public)');
      }
      const rawLogs = await getFilteredLogs(vaultId, initialPrefixes, newOffset, LIMIT, token || undefined);
      const receivedLogs = rawLogs.map((log: any) => ({
        ...log,
        timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : log.timestamp,
        created_at: log.created_at ? new Date(log.created_at).toISOString() : log.created_at,
        updated_at: log.updated_at ? new Date(log.updated_at).toISOString() : log.updated_at,
        deleted_at: log.deleted_at ? new Date(log.deleted_at).toISOString() : log.deleted_at,
      })) as LogEntry[];
      if (newOffset === 0) {
        setLogs(receivedLogs);
      } else {
        setLogs(prev => {
          const merged = [...prev, ...receivedLogs];
          // Dedupe by id
          const unique = merged.filter((log, index, self) => index === self.findIndex(l => l.id === log.id));
          return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });
      }
      setHasMore(receivedLogs.length === LIMIT);
      setOffset(newOffset + receivedLogs.length);
      setError(null);
      console.log('Fetched', receivedLogs.length, 'logs via HTTP at offset', newOffset);
      if (newOffset === 0 && isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    } catch (err: any) {
      console.error('HTTP fetch error details:', err.message, err.stack);
      setError(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [vaultId, initialPrefixes, loading]);

  // Fetch token on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Log all keys for debug
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('All AsyncStorage keys:', allKeys);

        const t = await AsyncStorage.getItem('access_token');
        console.log('Initial token fetch - exists:', !!t);
        if (t) {
          console.log('Token details - length:', t.length, 'starts with:', t.substring(0, 10) + '...');
        } else {
          console.log('Token value: null');
        }
        if (!t) {
          console.warn('No access_token in AsyncStorage; login may not have been completed or token expired. Cannot connect WS without token.');
          setToken(null);
          return;
        }
        console.log('Using real access_token for WebSocket');
        setToken(t);
      } catch (err) {
        console.error('Error fetching token from AsyncStorage:', err);
        setToken(null);
      }
    };
    fetchToken();
  }, []);

  // WS hook always, token optional
  const wsHook = useWebSocketEvents({
    vaultId,
    prefixes: initialPrefixes,
    token: token || ''
  });

  // Update status from WS readyState
  useEffect(() => {
    if (!wsHook) {
      setStatus('disconnected');
      return;
    }
    const mapStatus = (state: number): 'connecting' | 'connected' | 'disconnected' | 'error' => {
      switch (state) {
        case 0: return 'connecting';
        case 1: return 'connected';
        case 2: case 3: return 'disconnected';
        default: return 'error';
      }
    };
    setStatus(mapStatus(wsHook.readyState));
  }, [wsHook?.readyState]);

  // Handle new logs from WS
  useEffect(() => {
    if (wsHook?.lastJsonMessage?.type !== 'new_log' || !wsHook.lastJsonMessage.log) return;

    const newLog = wsHook.lastJsonMessage.log as LogEntry;
    if (!logs.some(log => log.id === newLog.id)) {
      setLogs(prev => [...prev, newLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      console.log('Appended new event from WS:', newLog.id);
    }
  }, [wsHook?.lastJsonMessage, logs]);

  // Fallback polling on long disconnect
  useEffect(() => {
    if (!wsHook) return;

    if (wsHook.readyState !== 1) { // Not OPEN
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      const timeoutId = setTimeout(() => {
        console.log('Long disconnect: fallback poll');
        fetchLogs(0);
      }, DISCONNECT_TIMEOUT) as unknown as number;
      setFallbackTimeout(timeoutId);
    } else {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        setFallbackTimeout(null);
      }
    }

    return () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [wsHook?.readyState, fallbackTimeout]);

  // Initial HTTP fetch on mount
  useEffect(() => {
    if (isInitialLoadRef.current) {
      fetchLogs(0);
    }
  }, [vaultId, initialPrefixes, fetchLogs]);

  const refresh = useCallback(() => fetchLogs(0), [fetchLogs]);

  const loadMore = useCallback(() => {
    if (hasMore && status !== 'error' && !loading) {
      fetchLogs(offset);
    }
  }, [offset, hasMore, status, fetchLogs, loading]);

  return {
    logs,
    status,
    error,
    hasMore,
    loadMore,
    refresh,
    loading,
  };
};