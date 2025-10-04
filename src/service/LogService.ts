import { ApiService } from './ApiService';
import { API_CONFIG } from '../config/api';

export interface LogEntry {
  id: number;
  message: string;
  prefix: string;
  created_at: string;
}

export interface GetLogsParams {
  vaultId: number;
  prefixes?: string[];
  offset?: number;
  limit?: number;
  token?: string;
}

export class LogService extends ApiService {
  /**
   * Get filtered logs for a vault
   */
  static async getFilteredLogs({
    vaultId,
    prefixes = API_CONFIG.DEFAULTS.PREFIXES,
    offset = API_CONFIG.DEFAULTS.LOG_OFFSET,
    limit = API_CONFIG.DEFAULTS.LOG_LIMIT,
    token,
  }: GetLogsParams): Promise<LogEntry[]> {
    const endpoint = API_CONFIG.ENDPOINTS.LOGS.FILTERED(vaultId);
    const queryParams = {
      prefixes: prefixes.join(','),
      offset: offset.toString(),
      limit: limit.toString(),
    };

    return this.get<LogEntry[]>(endpoint, token, queryParams);
  }

  /**
   * Get logs with default parameters
   */
  static async getDefaultLogs(token?: string): Promise<LogEntry[]> {
    return this.getFilteredLogs({
      vaultId: API_CONFIG.DEFAULTS.VAULT_ID,
      token,
    });
  }
}
