/**
 * Redis Logger Service
 * 
 * Handles Redis-based logging operations with proper error handling and retry logic.
 * Follows SOC: Separates Redis operations from business logic.
 * Implements clean architecture with dependency injection and error boundaries.
 */

import Redis, { RedisOptions } from 'ioredis';
import { redisConfig, RedisConfig } from '../config/redis';
import { LogEntry, LogLevel } from '../utils/logger';
import { log } from '../utils/logger';

export interface RedisLogEntry extends LogEntry {
  device_id?: string;
  vault_id?: number;
  user_id?: number;
  session_id?: string;
  metadata?: Record<string, any>;
}

export interface RedisLoggerOptions {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableBatching: boolean;
  batchSize: number;
  batchTimeout: number;
}

export interface RedisLoggerStats {
  totalLogs: number;
  successfulLogs: number;
  failedLogs: number;
  retryAttempts: number;
  lastError?: string;
  lastErrorTime?: string;
}

class RedisLoggerService {
  private redis: Redis | null = null;
  private isConnected: boolean = false;
  private stats: RedisLoggerStats = {
    totalLogs: 0,
    successfulLogs: 0,
    failedLogs: 0,
    retryAttempts: 0,
  };
  private options: RedisLoggerOptions;
  private logQueue: RedisLogEntry[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(options: Partial<RedisLoggerOptions> = {}) {
    this.options = {
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableBatching: true,
      batchSize: 10,
      batchTimeout: 5000,
      ...options,
    };
  }

  /**
   * Initialize Redis connection
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!redisConfig.isRedisEnabled()) {
        log.warn('RedisLogger', 'Redis is disabled in configuration');
        return false;
      }

      const config = redisConfig.getConfig();
      const redisOptions: RedisOptions = {
        ...config.config,
        retryDelayOnFailover: this.options.retryDelay,
        maxRetriesPerRequest: this.options.maxRetries,
        lazyConnect: true,
        onConnect: () => {
          this.isConnected = true;
          log.info('RedisLogger', 'Connected to Redis successfully');
        },
        onError: (error) => {
          this.isConnected = false;
          this.stats.lastError = error.message;
          this.stats.lastErrorTime = new Date().toISOString();
          log.error('RedisLogger', 'Redis connection error', error);
        },
        onClose: () => {
          this.isConnected = false;
          log.warn('RedisLogger', 'Redis connection closed');
        },
        onReconnecting: () => {
          log.info('RedisLogger', 'Reconnecting to Redis...');
        },
      };

      this.redis = new Redis(redisOptions);
      
      // Test connection
      await this.redis.ping();
      this.isConnected = true;
      
      log.info('RedisLogger', 'Redis logger initialized successfully');
      return true;
    } catch (error) {
      log.error('RedisLogger', 'Failed to initialize Redis logger', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Send log entry to Redis
   */
  public async sendLog(entry: RedisLogEntry): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      log.warn('RedisLogger', 'Redis not connected, queuing log for later');
      this.queueLog(entry);
      return false;
    }

    this.stats.totalLogs++;

    try {
      if (this.options.enableBatching) {
        this.queueLog(entry);
        return true;
      } else {
        return await this.sendLogImmediate(entry);
      }
    } catch (error) {
      this.handleLogError(entry, error);
      return false;
    }
  }

  /**
   * Send log immediately (bypass batching)
   */
  private async sendLogImmediate(entry: RedisLogEntry): Promise<boolean> {
    if (!this.redis) return false;

    const logKey = this.generateLogKey(entry);
    const logData = this.serializeLogEntry(entry);

    try {
      // Store log in Redis with TTL
      await this.redis.setex(logKey, 86400, logData); // 24 hours TTL

      // Publish to log stream for real-time updates
      if (entry.vault_id) {
        const channel = redisConfig.getVaultLogChannel(entry.vault_id);
        await this.redis.publish(channel, logData);
      }

      this.stats.successfulLogs++;
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Queue log for batch processing
   */
  private queueLog(entry: RedisLogEntry): void {
    this.logQueue.push(entry);

    if (this.logQueue.length >= this.options.batchSize) {
      this.processBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.options.batchTimeout);
    }
  }

  /**
   * Process queued logs in batch
   */
  private async processBatch(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const batch = this.logQueue.splice(0, this.options.batchSize);
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      if (!this.redis) throw new Error('Redis not connected');

      const pipeline = this.redis.pipeline();
      
      for (const entry of batch) {
        const logKey = this.generateLogKey(entry);
        const logData = this.serializeLogEntry(entry);
        
        pipeline.setex(logKey, 86400, logData);
        
        if (entry.vault_id) {
          const channel = redisConfig.getVaultLogChannel(entry.vault_id);
          pipeline.publish(channel, logData);
        }
      }

      await pipeline.exec();
      this.stats.successfulLogs += batch.length;
      
      log.debug('RedisLogger', `Processed batch of ${batch.length} logs`);
    } catch (error) {
      log.error('RedisLogger', 'Batch processing failed', error);
      this.stats.failedLogs += batch.length;
      
      // Re-queue failed logs for retry
      if (this.options.enableRetry) {
        this.logQueue.unshift(...batch);
      }
    }
  }

  /**
   * Generate Redis key for log entry
   */
  private generateLogKey(entry: RedisLogEntry): string {
    const timestamp = entry.timestamp || new Date().toISOString();
    const deviceId = entry.device_id || 'mobile-app';
    const vaultId = entry.vault_id || 'unknown';
    
    return `log:${deviceId}:${vaultId}:${timestamp}`;
  }

  /**
   * Serialize log entry for Redis storage
   */
  private serializeLogEntry(entry: RedisLogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      redis_timestamp: Date.now(),
    });
  }

  /**
   * Handle log sending errors
   */
  private handleLogError(entry: RedisLogEntry, error: any): void {
    this.stats.failedLogs++;
    this.stats.lastError = error.message;
    this.stats.lastErrorTime = new Date().toISOString();
    
    log.error('RedisLogger', 'Failed to send log to Redis', {
      error: error.message,
      entry: {
        level: entry.level,
        context: entry.context,
        message: entry.message,
      },
    });

    // Retry logic
    if (this.options.enableRetry && this.stats.retryAttempts < this.options.maxRetries) {
      this.stats.retryAttempts++;
      setTimeout(() => {
        this.sendLog(entry);
      }, this.options.retryDelay);
    }
  }

  /**
   * Get logger statistics
   */
  public getStats(): RedisLoggerStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalLogs: 0,
      successfulLogs: 0,
      failedLogs: 0,
      retryAttempts: 0,
    };
  }

  /**
   * Check if Redis is connected
   */
  public isRedisConnected(): boolean {
    return this.isConnected && this.redis !== null;
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    try {
      // Process any remaining queued logs
      if (this.logQueue.length > 0) {
        await this.processBatch();
      }

      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
        this.isConnected = false;
        log.info('RedisLogger', 'Disconnected from Redis');
      }
    } catch (error) {
      log.error('RedisLogger', 'Error disconnecting from Redis', error);
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      log.error('RedisLogger', 'Redis health check failed', error);
      return false;
    }
  }
}

// Export singleton instance
export const redisLogger = new RedisLoggerService();

// Export types for external use
export type { RedisLogEntry, RedisLoggerOptions, RedisLoggerStats };
