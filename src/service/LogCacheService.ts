/**
 * Log Cache Service
 * 
 * Handles offline log caching and synchronization with Redis.
 * Follows SOC: Separates caching concerns from business logic.
 * Implements cache-aside pattern with TTL and size limits.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { redisConfig } from '../config/redis';
import { log } from '../utils/logger';
import { LogEntry } from '../utils/logger';

export interface CachedLogEntry extends LogEntry {
  cache_timestamp: string;
  sync_status: 'pending' | 'synced' | 'failed';
  retry_count: number;
  vault_id?: number;
  device_id?: string;
}

export interface CacheOptions {
  maxCacheSize: number;
  ttl: number; // Time to live in milliseconds
  syncBatchSize: number;
  maxRetries: number;
  cleanupInterval: number;
}

export interface CacheStats {
  totalCached: number;
  pendingSync: number;
  synced: number;
  failed: number;
  cacheSize: number;
  lastCleanup: string;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

class LogCacheService {
  private static readonly CACHE_KEY_PREFIX = 'log_cache:';
  private static readonly STATS_KEY = 'log_cache_stats';
  private static readonly SYNC_QUEUE_KEY = 'log_sync_queue';
  
  private options: CacheOptions;
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      maxCacheSize: 1000,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      syncBatchSize: 50,
      maxRetries: 3,
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      ...options,
    };
    
    this.stats = {
      totalCached: 0,
      pendingSync: 0,
      synced: 0,
      failed: 0,
      cacheSize: 0,
      lastCleanup: new Date().toISOString(),
    };
  }

  /**
   * Initialize cache service
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!redisConfig.isCachingEnabled()) {
        log.warn('LogCache', 'Log caching is disabled in configuration');
        return false;
      }

      // Load existing stats
      await this.loadStats();
      
      // Start cleanup timer
      this.startCleanupTimer();
      
      log.info('LogCache', 'Log cache service initialized successfully');
      return true;
    } catch (error) {
      log.error('LogCache', 'Failed to initialize log cache service', error);
      return false;
    }
  }

  /**
   * Cache a log entry
   */
  public async cacheLog(entry: LogEntry, vaultId?: number, deviceId?: string): Promise<boolean> {
    try {
      const cachedEntry: CachedLogEntry = {
        ...entry,
        cache_timestamp: new Date().toISOString(),
        sync_status: 'pending',
        retry_count: 0,
        vault_id: vaultId,
        device_id: deviceId,
      };

      const cacheKey = this.generateCacheKey(cachedEntry);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedEntry));
      
      // Update stats
      this.stats.totalCached++;
      this.stats.pendingSync++;
      this.stats.cacheSize++;
      
      await this.saveStats();
      
      log.debug('LogCache', 'Log cached successfully', {
        cacheKey,
        vaultId,
        deviceId,
      });
      
      return true;
    } catch (error) {
      log.error('LogCache', 'Failed to cache log', error);
      return false;
    }
  }

  /**
   * Get cached logs for a vault
   */
  public async getCachedLogs(vaultId: number, limit: number = 100): Promise<CachedLogEntry[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_KEY_PREFIX) && 
        key.includes(`vault_${vaultId}`)
      );

      const logs: CachedLogEntry[] = [];
      
      for (const key of cacheKeys.slice(0, limit)) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const logEntry = JSON.parse(data) as CachedLogEntry;
            
            // Check if log is not expired
            if (!this.isLogExpired(logEntry)) {
              logs.push(logEntry);
            } else {
              // Remove expired log
              await AsyncStorage.removeItem(key);
              this.stats.cacheSize--;
            }
          }
        } catch (error) {
          log.error('LogCache', 'Failed to parse cached log', { key, error });
        }
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return logs;
    } catch (error) {
      log.error('LogCache', 'Failed to get cached logs', { vaultId, error });
      return [];
    }
  }

  /**
   * Get pending sync logs
   */
  public async getPendingSyncLogs(): Promise<CachedLogEntry[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      const pendingLogs: CachedLogEntry[] = [];
      
      for (const key of cacheKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const logEntry = JSON.parse(data) as CachedLogEntry;
            
            if (logEntry.sync_status === 'pending' && !this.isLogExpired(logEntry)) {
              pendingLogs.push(logEntry);
            }
          }
        } catch (error) {
          log.error('LogCache', 'Failed to parse pending log', { key, error });
        }
      }

      return pendingLogs;
    } catch (error) {
      log.error('LogCache', 'Failed to get pending sync logs', error);
      return [];
    }
  }

  /**
   * Sync cached logs with Redis
   */
  public async syncWithRedis(
    redisLogger: any, // RedisLoggerService instance
    batchSize: number = this.options.syncBatchSize
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      const pendingLogs = await this.getPendingSyncLogs();
      const batches = this.chunkArray(pendingLogs, batchSize);

      for (const batch of batches) {
        const batchResult = await this.syncBatch(batch, redisLogger);
        
        result.syncedCount += batchResult.syncedCount;
        result.failedCount += batchResult.failedCount;
        result.errors.push(...batchResult.errors);
      }

      // Update stats
      this.stats.pendingSync -= result.syncedCount;
      this.stats.synced += result.syncedCount;
      this.stats.failed += result.failedCount;
      
      await this.saveStats();
      
      log.info('LogCache', 'Sync completed', {
        synced: result.syncedCount,
        failed: result.failedCount,
        errors: result.errors.length,
      });

      return result;
    } catch (error) {
      log.error('LogCache', 'Sync failed', error);
      result.success = false;
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Sync a batch of logs
   */
  private async syncBatch(
    batch: CachedLogEntry[],
    redisLogger: any
  ): Promise<{ syncedCount: number; failedCount: number; errors: string[] }> {
    const result = { syncedCount: 0, failedCount: 0, errors: [] };

    for (const logEntry of batch) {
      try {
        const success = await redisLogger.sendLog(logEntry);
        
        if (success) {
          // Mark as synced
          logEntry.sync_status = 'synced';
          await this.updateCachedLog(logEntry);
          result.syncedCount++;
        } else {
          // Increment retry count
          logEntry.retry_count++;
          
          if (logEntry.retry_count >= this.options.maxRetries) {
            logEntry.sync_status = 'failed';
            result.failedCount++;
          }
          
          await this.updateCachedLog(logEntry);
        }
      } catch (error) {
        logEntry.retry_count++;
        logEntry.sync_status = 'failed';
        await this.updateCachedLog(logEntry);
        
        result.failedCount++;
        result.errors.push(error.message);
      }
    }

    return result;
  }

  /**
   * Update cached log entry
   */
  private async updateCachedLog(logEntry: CachedLogEntry): Promise<void> {
    const cacheKey = this.generateCacheKey(logEntry);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(logEntry));
  }

  /**
   * Generate cache key for log entry
   */
  private generateCacheKey(logEntry: CachedLogEntry): string {
    const timestamp = logEntry.timestamp || new Date().toISOString();
    const deviceId = logEntry.device_id || 'mobile-app';
    const vaultId = logEntry.vault_id || 'unknown';
    
    return `${this.CACHE_KEY_PREFIX}${deviceId}_${vaultId}_${timestamp}`;
  }

  /**
   * Check if log is expired
   */
  private isLogExpired(logEntry: CachedLogEntry): boolean {
    const cacheTime = new Date(logEntry.cache_timestamp).getTime();
    const now = Date.now();
    return (now - cacheTime) > this.options.ttl;
  }

  /**
   * Clean up expired logs
   */
  public async cleanup(): Promise<number> {
    let cleanedCount = 0;
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      for (const key of cacheKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const logEntry = JSON.parse(data) as CachedLogEntry;
            
            if (this.isLogExpired(logEntry)) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
              this.stats.cacheSize--;
            }
          }
        } catch (error) {
          // Remove corrupted entries
          await AsyncStorage.removeItem(key);
          cleanedCount++;
          this.stats.cacheSize--;
        }
      }

      // Update stats
      this.stats.lastCleanup = new Date().toISOString();
      await this.saveStats();
      
      log.info('LogCache', `Cleanup completed, removed ${cleanedCount} expired logs`);
      return cleanedCount;
    } catch (error) {
      log.error('LogCache', 'Cleanup failed', error);
      return cleanedCount;
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(async () => {
      await this.cleanup();
    }, this.options.cleanupInterval);
  }

  /**
   * Load stats from storage
   */
  private async loadStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STATS_KEY);
      if (data) {
        this.stats = { ...this.stats, ...JSON.parse(data) };
      }
    } catch (error) {
      log.error('LogCache', 'Failed to load stats', error);
    }
  }

  /**
   * Save stats to storage
   */
  private async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      log.error('LogCache', 'Failed to save stats', error);
    }
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all cached logs
   */
  public async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      // Reset stats
      this.stats = {
        totalCached: 0,
        pendingSync: 0,
        synced: 0,
        failed: 0,
        cacheSize: 0,
        lastCleanup: new Date().toISOString(),
      };
      
      await this.saveStats();
      
      log.info('LogCache', 'Cache cleared successfully');
    } catch (error) {
      log.error('LogCache', 'Failed to clear cache', error);
    }
  }

  /**
   * Disconnect and cleanup
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      
      log.info('LogCache', 'Log cache service disconnected');
    } catch (error) {
      log.error('LogCache', 'Error disconnecting cache service', error);
    }
  }
}

// Export singleton instance
export const logCacheService = new LogCacheService();

// Export types for external use
export type { CachedLogEntry, CacheOptions, CacheStats, SyncResult };
