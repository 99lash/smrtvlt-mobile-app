/**
 * Simple Redis Usage Example
 * 
 * This example shows the simplest way to use Redis logging in your app.
 * Copy and paste this into your main App component or initialization code.
 */

import { redisIntegrationService } from '../service/RedisIntegrationService';
import { log } from '../utils/logger';

/**
 * Initialize Redis logging for your app
 */
export async function initializeRedisLogging() {
  try {
    // Configure Redis integration
    const success = await redisIntegrationService.initialize({
      vaultId: 123, // Your vault ID
      deviceId: 'mobile-app-001', // Your device ID
      userId: 456, // Your user ID (optional)
      enableLogging: true, // Send logs to Redis
      enableCaching: true, // Cache logs for offline support
      enableStreaming: true, // Receive real-time log updates
      autoSync: true, // Automatically sync cached logs
      syncInterval: 30000, // Sync every 30 seconds
    });

    if (success) {
      console.log('✅ Redis logging initialized successfully');
      
      // Test logging
      await log.info('APP', 'Redis logging is now active');
      await log.debug('APP', 'Configuration loaded', {
        vaultId: 123,
        deviceId: 'mobile-app-001',
      });
    } else {
      console.error('❌ Failed to initialize Redis logging');
    }
  } catch (error) {
    console.error('❌ Error initializing Redis logging:', error);
  }
}

/**
 * Set up real-time log monitoring
 */
export async function setupRealTimeMonitoring() {
  try {
    // Subscribe to real-time log updates
    const success = await redisIntegrationService.subscribeToLogs((logEvent) => {
      console.log('📡 Real-time log received:', logEvent);
      
      // Handle different types of log events
      if (logEvent.type === 'new_log') {
        console.log('📝 New log:', logEvent.data);
      } else if (logEvent.type === 'error') {
        console.error('❌ Log streaming error:', logEvent.data);
      }
    });

    if (success) {
      console.log('✅ Real-time monitoring enabled');
    }
  } catch (error) {
    console.error('❌ Failed to set up real-time monitoring:', error);
  }
}

/**
 * Check Redis integration status
 */
export async function checkRedisStatus() {
  try {
    const status = await redisIntegrationService.getStatus();
    
    console.log('📊 Redis Integration Status:');
    console.log('- Connected:', status.isConnected);
    console.log('- Logging enabled:', status.isLoggingEnabled);
    console.log('- Caching enabled:', status.isCachingEnabled);
    console.log('- Streaming enabled:', status.isStreamingEnabled);
    console.log('- Redis stats:', status.stats.redis);
    console.log('- Cache stats:', status.stats.cache);
  } catch (error) {
    console.error('❌ Failed to check status:', error);
  }
}

/**
 * Clean up when app closes
 */
export async function cleanupRedisLogging() {
  try {
    await redisIntegrationService.disconnect();
    console.log('✅ Redis logging cleaned up');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

/**
 * Complete example for App.tsx
 */
export const AppInitializationExample = `
// In your App.tsx or main component:

import React, { useEffect } from 'react';
import { initializeRedisLogging, setupRealTimeMonitoring, cleanupRedisLogging } from './src/examples/SimpleRedisUsage';

export default function App() {
  useEffect(() => {
    // Initialize Redis logging when app starts
    initializeRedisLogging().then(() => {
      setupRealTimeMonitoring();
    });

    // Cleanup when app unmounts
    return () => {
      cleanupRedisLogging();
    };
  }, []);

  return (
    // Your app components
  );
};
`;

/**
 * Example of logging throughout your app
 */
export const LoggingExamples = `
// Now you can use logging anywhere in your app:

import { log } from '../utils/logger';

// Basic logging (automatically sent to Redis)
await log.info('USER', 'User logged in');
await log.debug('VAULT', 'Vault access attempt', { method: 'NFC' });
await log.warn('SECURITY', 'Failed authentication', { user: 'unknown' });
await log.error('APP', 'Something went wrong', error);

// API logging
log.api.request('POST', '/api/vaults', { name: 'My Vault' });
log.api.response('POST', '/api/vaults', 201, response);

// User action logging
log.user('vault_access', { vaultId: 123, method: 'NFC' });

// Performance logging
log.performance('vault_unlock', 150, { method: 'NFC' });
`;
