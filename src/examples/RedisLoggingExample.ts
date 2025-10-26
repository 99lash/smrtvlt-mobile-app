/**
 * Redis Logging Example
 * 
 * Demonstrates how to use Redis logging features in the mobile app.
 * This file serves as documentation and example usage.
 */

import { logger, log } from '../utils/logger';
import { redisConfig } from '../config/redis';

/**
 * Example: Basic Redis Logging Setup
 */
export async function setupBasicRedisLogging() {
  // Enable Redis logging with vault and device information
  logger.enableRedisLogging(
    123, // vaultId
    'mobile-app-001', // deviceId
    456 // userId
  );

  // Enable log caching for offline support
  logger.enableLogCaching(123, 'mobile-app-001');

  // Enable real-time log streaming
  logger.enableLogStreaming(123);

  // Now all logs will be sent to Redis
  await log.info('SETUP', 'Redis logging configured successfully');
  await log.debug('SETUP', 'Configuration details', {
    vaultId: 123,
    deviceId: 'mobile-app-001',
    userId: 456,
  });
}

/**
 * Example: Real-time Log Streaming
 */
export async function setupRealTimeLogging() {
  // Subscribe to real-time log updates for a vault
  const vaultId = 123;
  
  await logger.subscribeToLogs(vaultId, (logEvent) => {
    console.log('Real-time log received:', logEvent);
    
    // Handle different event types
    switch (logEvent.type) {
      case 'new_log':
        console.log('New log:', logEvent.data);
        break;
      case 'error':
        console.error('Log streaming error:', logEvent.data);
        break;
      case 'connected':
        console.log('Connected to log streaming');
        break;
      case 'disconnected':
        console.log('Disconnected from log streaming');
        break;
    }
  });

  // Log some events that will be streamed in real-time
  await log.info('VAULT', 'Vault access attempt', { method: 'NFC' });
  await log.warn('SECURITY', 'Failed authentication attempt', { 
    user: 'unknown',
    method: 'PIN' 
  });
}

/**
 * Example: Offline Log Caching
 */
export async function demonstrateOfflineLogging() {
  // Enable caching
  logger.enableLogCaching(123, 'mobile-app-001');

  // Log events while offline (they will be cached)
  await log.info('OFFLINE', 'User attempted vault access while offline');
  await log.debug('OFFLINE', 'Cached log entry created', {
    timestamp: new Date().toISOString(),
    offline: true,
  });

  // When back online, sync cached logs
  const syncResult = await logger.syncCachedLogs();
  console.log('Sync result:', syncResult);
}

/**
 * Example: Advanced Configuration
 */
export async function advancedConfiguration() {
  // Configure Redis settings
  redisConfig.updateConfig({
    enableRedis: true,
    config: {
      host: 'localhost',
      port: 6379,
      password: 'your-password',
      db: 0,
    },
    logStreaming: {
      enabled: true,
      channels: ['new_log:vault_*', 'security_events:*'],
    },
    caching: {
      enabled: true,
      ttl: 3600, // 1 hour
    },
  });

  // Enable all Redis features
  logger.configure({
    enableRedisLogging: true,
    enableLogCaching: true,
    enableLogStreaming: true,
    vaultId: 123,
    deviceId: 'mobile-app-001',
    userId: 456,
  });

  // Log with context
  await log.info('ADVANCED', 'Advanced configuration applied', {
    redisEnabled: true,
    cachingEnabled: true,
    streamingEnabled: true,
  });
}

/**
 * Example: Monitoring and Statistics
 */
export async function monitorLoggingPerformance() {
  // Get Redis logger statistics
  const redisStats = await logger.getRedisStats();
  console.log('Redis Stats:', redisStats);
  // Output: { totalLogs: 150, successfulLogs: 148, failedLogs: 2, retryAttempts: 1 }

  // Get cache statistics
  const cacheStats = await logger.getCacheStats();
  console.log('Cache Stats:', cacheStats);
  // Output: { totalCached: 45, pendingSync: 3, synced: 42, failed: 0, cacheSize: 45 }

  // Check connection status
  const connectionStatus = redisConfig.isRedisEnabled();
  console.log('Redis enabled:', connectionStatus);
}

/**
 * Example: Error Handling and Recovery
 */
export async function handleLoggingErrors() {
  try {
    // Attempt to log with Redis
    await log.error('ERROR_HANDLING', 'Testing error handling', {
      error: 'Test error',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Logging failed:', error);
    
    // Fallback to console logging
    console.error('Fallback logging:', {
      message: 'Logging failed, using fallback',
      originalError: error,
    });
  }
}

/**
 * Example: Cleanup and Disconnection
 */
export async function cleanupLogging() {
  // Unsubscribe from log updates
  await logger.unsubscribeFromLogs(123);

  // Sync any remaining cached logs
  await logger.syncCachedLogs();

  // Disconnect all Redis services
  await logger.disconnectRedisServices();

  console.log('Logging services disconnected');
}

/**
 * Example: Integration with Existing Services
 */
export async function integrateWithExistingServices() {
  // This would typically be called from your main app initialization
  const vaultId = 123;
  const deviceId = 'mobile-app-001';
  const userId = 456;

  // Initialize Redis logging
  await setupBasicRedisLogging();

  // Set up real-time streaming
  await setupRealTimeLogging();

  // Configure for your specific vault
  logger.configure({
    vaultId,
    deviceId,
    userId,
    enableRedisLogging: true,
    enableLogCaching: true,
    enableLogStreaming: true,
  });

  // Now all your existing log calls will automatically use Redis
  await log.info('APP', 'Application started with Redis logging');
  await log.debug('APP', 'User logged in', { userId, vaultId });
}

// Export all examples for easy testing
export const RedisLoggingExamples = {
  setupBasicRedisLogging,
  setupRealTimeLogging,
  demonstrateOfflineLogging,
  advancedConfiguration,
  monitorLoggingPerformance,
  handleLoggingErrors,
  cleanupLogging,
  integrateWithExistingServices,
};
