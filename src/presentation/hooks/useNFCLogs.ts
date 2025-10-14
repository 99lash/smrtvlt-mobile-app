import { useState, useEffect, useCallback } from 'react';
import { LogService, LogEntry } from '../../service/LogService';
import { StorageService } from '../../config/api';
import { extractNFCCardUID, hasNFCData } from '../../utils/nfcUtils';
import { ApiError } from '../../service/ApiService';

export interface NFCLogData {
   uid: string;
   device_id: string;
   created_at: string;  // Keep this name for component compatibility
   vault_id?: number;
   event_type?: string;
 }

export const useNFCLogs = (vaultId?: number) => {
  const [nfcLogs, setNfcLogs] = useState<NFCLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const fetchNFCLogs = useCallback(async () => {
    if (!vaultId) return;

    try {
      setLoading(true);
      setError(null);
      setIsAuthenticated(true);

      console.log('🔄 === NFC LOGS DEBUG START ===');
      console.log('🏠 Vault ID being used:', vaultId);
      console.log('📍 Fetching fresh NFC logs for vault:', vaultId);

      const token = await StorageService.getAccessToken();
      console.log('🔑 Authentication token available:', !!token);

      if (!token) {
        console.log('❌ No authentication token found');
        setError('Please log in to access NFC card data');
        setIsAuthenticated(false);
        return;
      }

      console.log('📡 Calling LogService.getFilteredLogs with NFC-specific parameters...');
      const logEntries: LogEntry[] = await LogService.getFilteredLogs({
        vaultId,
        limit: 1, // ✅ Only get the most recent log
        token: token || undefined,
      });

      // ✅ DEBUG: Check what we actually received
      console.log('🔍 RAW API RESPONSE - Number of logs:', logEntries.length);
      console.log('🔍 RAW API RESPONSE - First log:', logEntries[0]);
      console.log('🔍 RAW API RESPONSE - First log timestamp:', logEntries[0]?.timestamp);
      console.log('🔍 RAW API RESPONSE - First log ID:', logEntries[0]?.id);
      console.log('🔍 RAW API RESPONSE - First log details:', logEntries[0]?.details);

      console.log('📊 Raw logs received:', logEntries.length, 'log(s)');
      if (logEntries.length > 0) {
        console.log('📋 Most recent log details:');
        const log = logEntries[0];
        console.log(`  ${log.event_type}: "${log.details}" (ID: ${log.id})`);
      }


      const failedAttemptLogs = logEntries.filter(log => log.event_type === 'failed_attempt');

      const nfcFailedLogs = logEntries.filter(log =>
        hasNFCData(log.details) &&
        log.event_type === 'failed_attempt'
      );
      console.log('🎯 NFC failed attempt logs found:', nfcFailedLogs.length);

      const nfcData: NFCLogData[] = logEntries
        .filter(log =>
          hasNFCData(log.details) &&
          log.event_type === 'failed_attempt'  // ✅ Only failed attempts
        )
        .map(log => {
          const uid = extractNFCCardUID(log.details);

          // ✅ CRITICAL FIX: Use timestamp field from API, rename to created_at for components
          const created_at = log.timestamp || new Date().toISOString();

          console.log('🔍 Processing NFC Failed Attempt Log:', {
            id: log.id,
            event_type: log.event_type,
            timestamp: log.timestamp,  // ✅ API field name
            created_at: created_at,    // ✅ Our field name
            details: log.details,
            extracted_uid: uid,
            device_id: log.device_id,
            vault_id: log.vault_id
          });

          return {
            uid: uid || 'unknown',
            device_id: log.device_id || 'unknown',
            created_at: created_at,  // ✅ Use the API's timestamp field
            vault_id: log.vault_id,
            event_type: log.event_type
          };
        })
        .filter(nfc => nfc.uid !== 'unknown');

      console.log('📱 === FINAL NFC DATA RESULTS ===');
      console.log('📱 Mobile app NFC data processed:', nfcData.length, 'NFC card(s) found');
      if (nfcData.length > 0) {
        const nfc = nfcData[0];
        console.log(`  UID: ${nfc.uid}, Device: ${nfc.device_id}, Time: ${nfc.created_at}, Event: ${nfc.event_type}`);
      } else {
        console.log('❌ No NFC cards found in failed attempt logs');
      }

      console.log('🔍 === NFC DATA PROCESSING DEBUG END ===');
      
      // ✅ Always update state, even if empty (to trigger re-render)
      setNfcLogs(nfcData);
    } catch (err) {
      console.error('Error fetching NFC logs:', err);

      if (err instanceof ApiError && err.status === 401) {
        setError('Authentication expired. Please log in again.');
        setIsAuthenticated(false);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFC logs');
        setIsAuthenticated(true);
      }

      setNfcLogs([]);
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  const getMostRecentNFC = useCallback((): NFCLogData | null => {
    if (nfcLogs.length === 0) return null;

    // ✅ Since we're only getting 1 log with limit:1, just return it
    // No sorting needed!
    const mostRecent = nfcLogs[0];

    if (__DEV__) {
      console.log('🎯 Most recent NFC card (from state):', {
        uid: mostRecent.uid,
        created_at: mostRecent.created_at,
        totalCards: nfcLogs.length
      });
    }

    return mostRecent;
  }, [nfcLogs]);

  useEffect(() => {
    if (vaultId) {
      fetchNFCLogs();
    }
  }, [vaultId, fetchNFCLogs]);

  const handleLogout = useCallback(async () => {
    try {
      await StorageService.removeAccessToken();
      setIsAuthenticated(false);
      setError('Please log in again');
      setNfcLogs([]);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  return {
    nfcLogs,
    loading,
    error,
    isAuthenticated,
    getMostRecentNFC,
    refreshNFCLogs: fetchNFCLogs,
    handleLogout
  };
};