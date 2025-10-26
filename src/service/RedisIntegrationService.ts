/**
 * Redis Integration Service
 * 
 * High-level service that orchestrates all Redis logging features.
 * Follows SOC: Provides a single interface for Redis logging operations.
 * Implements facade pattern to simplify complex Redis operations.
 */

import { logger } from '../utils/logger';
import { redisConfig } from '../config/redis';
import { log } from '../utils/logger';

export interface RedisIntegrationConfig {
  vaultId: number;
  deviceId: string;
  userId?: number;
  enableLogging: boolean;
  enableCaching: boolean;
  enableStreaming: boolean;
  autoSync: boolean;
  syncInterval: number; // milliseconds
}

export interface RedisIntegrationStatus {
  isConnected: boolean;
  isLoggingEnabled: boolean;
  isCachingEnabled: boolean;
  isStreamingEnabled: boolean;
  stats: {
    redis: any;
    cache: any;
    streaming: any;
  };
}

class RedisIntegrationService {
  private static instance: RedisIntegrationService;
  private config: RedisIntegrationConfig | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): RedisIntegrationService {
    if (!RedisIntegrationService.instance) {
      RedisIntegrationService.instance = new RedisIntegrationService();
    }
    return RedisIntegrationService.instance;
  }

  /**
   * Initialize Redis integration with configuration
   */
  public async initialize(config: RedisIntegrationConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // Configure logger with Redis features
      logger.configure({
        enableRedisLogging: config.enableLogging,
        enableLogCaching: config.enableCaching,
        enableLogStreaming: config.enableStreaming,
        vaultId: config.vaultId,
        deviceId: config.deviceId,
        userId: config.userId,
      });

      // Initialize Redis services
      await this.initializeRedisServices();

      // Set up auto-sync if enabled
      if (config.autoSync && config.syncInterval > 0) {
        this.startAutoSync();
      }

      this.isInitialized = true;
      
      await log.info('RedisIntegration', 'Redis integration initialized successfully', {
        vaultId: config.vaultId,
        deviceId: config.deviceId,
        features: {
          logging: config.enableLogging,
          caching: config.enableCaching,
          streaming: config.enableStreaming,
        },
      });

      return true;
    } catch (error) {
      await log.error('RedisIntegration', 'Failed to initialize Redis integration', error);
      return false;
    }
  }

  /**
   * Initialize Redis services
   */
  private async initializeRedisServices(): Promise<void> {
    if (!this.config) return;

    // Initialize Redis logger
    if (this.config.enableLogging) {
      await logger.enableRedisLogging(
        this.config.vaultId,
        this.config.deviceId,
        this.config.userId
      );
    }

    // Initialize log caching
    if (this.config.enableCaching) {
      await logger.enableLogCaching(
        this.config.vaultId,
        this.config.deviceId
      );
    }

    // Initialize log streaming
    if (this.config.enableStreaming) {
      await logger.enableLogStreaming(this.config.vaultId);
    }
  }

  /**
   * Start automatic synchronization
   */
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      try {
        await this.syncCachedLogs();
      } catch (error) {
        await log.error('RedisIntegration', 'Auto-sync failed', error);
      }
    }, this.config?.syncInterval || 30000);
  }

  /**
   * Stop automatic synchronization
   */
  public stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Sync cached logs with Redis
   */
  public async syncCachedLogs(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Redis integration not initialized');
    }

    try {
      const result = await logger.syncCachedLogs();
      await log.debug('RedisIntegration', 'Cached logs synced', {
        synced: result?.syncedCount || 0,
        failed: result?.failedCount || 0,
      });
      return result;
    } catch (error) {
      await log.error('RedisIntegration', 'Failed to sync cached logs', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time log updates
   */
  public async subscribeToLogs(callback: (log: any) => void): Promise<boolean> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Redis integration not initialized');
    }

    try {
      const success = await logger.subscribeToLogs(this.config.vaultId, callback);
      if (success) {
        await log.info('RedisIntegration', 'Subscribed to real-time log updates');
      }
      return success;
    } catch (error) {
      await log.error('RedisIntegration', 'Failed to subscribe to logs', error);
      return false;
    }
  }

  /**
   * Unsubscribe from log updates
   */
  public async unsubscribeFromLogs(): Promise<boolean> {
    if (!this.isInitialized || !this.config) {
      return false;
    }

    try {
      const success = await logger.unsubscribeFromLogs(this.config.vaultId);
      if (success) {
        await log.info('RedisIntegration', 'Unsubscribed from log updates');
      }
      return success;
    } catch (error) {
      await log.error('RedisIntegration', 'Failed to unsubscribe from logs', error);
      return false;
    }
  }

  /**
   * Get integration status
   */
  public async getStatus(): Promise<RedisIntegrationStatus> {
    if (!this.isInitialized) {
      return {
        isConnected: false,
        isLoggingEnabled: false,
        isCachingEnabled: false,
        isStreamingEnabled: false,
        stats: { redis: null, cache: null, streaming: null },
      };
    }

    try {
      const [redisStats, cacheStats] = await Promise.all([
        logger.getRedisStats(),
        logger.getCacheStats(),
      ]);

      return {
        isConnected: redisConfig.isRedisEnabled(),
        isLoggingEnabled: this.config?.enableLogging || false,
        isCachingEnabled: this.config?.enableCaching || false,
        isStreamingEnabled: this.config?.enableStreaming || false,
        stats: {
          redis: redisStats,
          cache: cacheStats,
          streaming: null, // Could be extended
        },
      };
    } catch (error) {
      await log.error('RedisIntegration', 'Failed to get status', error);
      return {
        isConnected: false,
        isLoggingEnabled: false,
        isCachingEnabled: false,
        isStreamingEnabled: false,
        stats: { redis: null, cache: null, streaming: null },
      };
    }
  }

  /**
   * Update configuration
   */
  public async updateConfig(updates: Partial<RedisIntegrationConfig>): Promise<boolean> {
    if (!this.isInitialized || !this.config) {
      return false;
    }

    try {
      this.config = { ...this.config, ...updates };
      
      // Reconfigure logger
      logger.configure({
        enableRedisLogging: this.config.enableLogging,
        enableLogCaching: this.config.enableCaching,
        enableLogStreaming: this.config.enableStreaming,
        vaultId: this.config.vaultId,
        deviceId: this.config.deviceId,
        userId: this.config.userId,
      });

      // Update auto-sync if needed
      if (this.config.autoSync && this.config.syncInterval > 0) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }

      await log.info('RedisIntegration', 'Configuration updated', updates);
      return true;
    } catch (error) {
      await log.error('RedisIntegration', 'Failed to update configuration', error);
      return false;
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const status = await this.getStatus();
      return status.isConnected && (
        status.isLoggingEnabled || 
        status.isCachingEnabled || 
        status.isStreamingEnabled
      );
    } catch (error) {
      await log.error('RedisIntegration', 'Health check failed', error);
      return false;
    }
  }

  /**
   * Disconnect and cleanup
   */
  public async disconnect(): Promise<void> {
    try {
      // Stop auto-sync
      this.stopAutoSync();

      // Unsubscribe from logs
      await this.unsubscribeFromLogs();

      // Disconnect Redis services
      await logger.disconnectRedisServices();

      this.isInitialized = false;
      this.config = null;

      await log.info('RedisIntegration', 'Redis integration disconnected');
    } catch (error) {
      await log.error('RedisIntegration', 'Error during disconnect', error);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): RedisIntegrationConfig | null {
    return this.config ? { ...this.config } : null;
  }

  /**
   * Check if initialized
   */
  public isInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const redisIntegrationService = RedisIntegrationService.getInstance();

// Export types for external use
export type { RedisIntegrationConfig, RedisIntegrationStatus };
