/**
 * Log Streaming Service
 * 
 * Handles real-time log streaming from Redis using pub/sub.
 * Follows SOC: Separates streaming concerns from business logic.
 * Implements observer pattern for real-time log updates.
 */

import Redis, { RedisOptions } from 'ioredis';
import { redisConfig } from '../config/redis';
import { log } from '../utils/logger';
import { LogEntry } from '../utils/logger';

export interface LogStreamOptions {
  enableAutoReconnect: boolean;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  subscriptionTimeout: number;
}

export interface LogStreamEvent {
  type: 'new_log' | 'error' | 'connected' | 'disconnected' | 'reconnecting';
  data?: any;
  timestamp: string;
  vaultId?: number;
}

export interface LogStreamSubscription {
  vaultId: number;
  channels: string[];
  isActive: boolean;
  lastActivity: string;
}

export type LogStreamCallback = (event: LogStreamEvent) => void;

class LogStreamingService {
  private redis: Redis | null = null;
  private isConnected: boolean = false;
  private subscriptions: Map<number, LogStreamSubscription> = new Map();
  private callbacks: Set<LogStreamCallback> = new Set();
  private options: LogStreamOptions;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: Partial<LogStreamOptions> = {}) {
    this.options = {
      enableAutoReconnect: true,
      reconnectDelay: 2000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      subscriptionTimeout: 10000,
      ...options,
    };
  }

  /**
   * Initialize Redis connection for streaming
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!redisConfig.isLogStreamingEnabled()) {
        log.warn('LogStreaming', 'Log streaming is disabled in configuration');
        return false;
      }

      const config = redisConfig.getConfig();
      const redisOptions: RedisOptions = {
        ...config.config,
        lazyConnect: true,
        onConnect: () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emitEvent({
            type: 'connected',
            timestamp: new Date().toISOString(),
          });
          this.startHeartbeat();
          log.info('LogStreaming', 'Connected to Redis for streaming');
        },
        onError: (error) => {
          this.isConnected = false;
          this.emitEvent({
            type: 'error',
            data: error,
            timestamp: new Date().toISOString(),
          });
          log.error('LogStreaming', 'Redis streaming error', error);
          this.handleReconnection();
        },
        onClose: () => {
          this.isConnected = false;
          this.emitEvent({
            type: 'disconnected',
            timestamp: new Date().toISOString(),
          });
          log.warn('LogStreaming', 'Redis streaming connection closed');
          this.handleReconnection();
        },
        onReconnecting: () => {
          this.emitEvent({
            type: 'reconnecting',
            timestamp: new Date().toISOString(),
          });
          log.info('LogStreaming', 'Reconnecting to Redis for streaming...');
        },
      };

      this.redis = new Redis(redisOptions);
      
      // Test connection
      await this.redis.ping();
      this.isConnected = true;
      
      log.info('LogStreaming', 'Log streaming service initialized successfully');
      return true;
    } catch (error) {
      log.error('LogStreaming', 'Failed to initialize log streaming service', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Subscribe to logs for a specific vault
   */
  public async subscribeToVault(vaultId: number, prefixes: string[] = []): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      log.warn('LogStreaming', 'Redis not connected, cannot subscribe to vault', { vaultId });
      return false;
    }

    try {
      const channels = [
        redisConfig.getVaultLogChannel(vaultId),
        redisConfig.getLogEventsChannel(),
        redisConfig.getSecurityEventsChannel(),
      ];

      // Subscribe to channels
      await this.redis.subscribe(...channels);

      // Set up message handler
      this.redis.on('message', (channel, message) => {
        this.handleLogMessage(channel, message, vaultId);
      });

      // Track subscription
      this.subscriptions.set(vaultId, {
        vaultId,
        channels,
        isActive: true,
        lastActivity: new Date().toISOString(),
      });

      log.info('LogStreaming', `Subscribed to vault ${vaultId} logs`, { channels });
      return true;
    } catch (error) {
      log.error('LogStreaming', 'Failed to subscribe to vault logs', { vaultId, error });
      return false;
    }
  }

  /**
   * Unsubscribe from vault logs
   */
  public async unsubscribeFromVault(vaultId: number): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const subscription = this.subscriptions.get(vaultId);
      if (!subscription) return true;

      // Unsubscribe from channels
      await this.redis.unsubscribe(...subscription.channels);
      
      // Remove subscription
      this.subscriptions.delete(vaultId);

      log.info('LogStreaming', `Unsubscribed from vault ${vaultId} logs`);
      return true;
    } catch (error) {
      log.error('LogStreaming', 'Failed to unsubscribe from vault logs', { vaultId, error });
      return false;
    }
  }

  /**
   * Handle incoming log messages
   */
  private handleLogMessage(channel: string, message: string, vaultId: number): void {
    try {
      const logData = JSON.parse(message);
      
      // Update subscription activity
      const subscription = this.subscriptions.get(vaultId);
      if (subscription) {
        subscription.lastActivity = new Date().toISOString();
      }

      // Emit log event
      this.emitEvent({
        type: 'new_log',
        data: logData,
        timestamp: new Date().toISOString(),
        vaultId,
      });

      log.debug('LogStreaming', 'Received log message', {
        channel,
        vaultId,
        logType: logData.event_type,
      });
    } catch (error) {
      log.error('LogStreaming', 'Failed to parse log message', {
        channel,
        message,
        error,
      });
    }
  }

  /**
   * Add event callback
   */
  public addCallback(callback: LogStreamCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove event callback
   */
  public removeCallback(callback: LogStreamCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Emit event to all callbacks
   */
  private emitEvent(event: LogStreamEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        log.error('LogStreaming', 'Error in event callback', error);
      }
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(async () => {
      if (this.redis && this.isConnected) {
        try {
          await this.redis.ping();
        } catch (error) {
          log.error('LogStreaming', 'Heartbeat failed', error);
          this.handleReconnection();
        }
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (!this.options.enableAutoReconnect) return;
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      log.error('LogStreaming', 'Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(async () => {
      log.info('LogStreaming', `Reconnection attempt ${this.reconnectAttempts}`);
      
      try {
        if (this.redis) {
          await this.redis.connect();
        }
      } catch (error) {
        log.error('LogStreaming', 'Reconnection failed', error);
        this.handleReconnection();
      }
    }, this.options.reconnectDelay);
  }

  /**
   * Get active subscriptions
   */
  public getActiveSubscriptions(): LogStreamSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Check if connected
   */
  public isStreamingConnected(): boolean {
    return this.isConnected && this.redis !== null;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    connected: boolean;
    subscriptions: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    try {
      // Clear timers
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Unsubscribe from all channels
      if (this.redis && this.isConnected) {
        const allChannels = Array.from(this.subscriptions.values())
          .flatMap(sub => sub.channels);
        
        if (allChannels.length > 0) {
          await this.redis.unsubscribe(...allChannels);
        }
      }

      // Close connection
      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
        this.isConnected = false;
      }

      // Clear subscriptions
      this.subscriptions.clear();

      log.info('LogStreaming', 'Disconnected from Redis streaming');
    } catch (error) {
      log.error('LogStreaming', 'Error disconnecting from Redis streaming', error);
    }
  }
}

// Export singleton instance
export const logStreamingService = new LogStreamingService();

// Export types for external use
export type { LogStreamOptions, LogStreamEvent, LogStreamSubscription, LogStreamCallback };
