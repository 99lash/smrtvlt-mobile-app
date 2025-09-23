export interface WSQueryRequest {
  vault_id: number;
  prefixes: string[];
}

export interface LogEntry {
  id: number;
  vault_id: number;
  user_id?: number;
  event_type: string;
  details: string;
  timestamp: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}