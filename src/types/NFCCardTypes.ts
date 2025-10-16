// NFC Card Types - Matching backend schema
export interface NFCCardCreateRequest {
  uid: string;
  user_id?: number;
  vault_id: number;
}

export interface NFCCardAssignRequest {
  user_id: number;
}

export interface NFCCardResponse {
  id: number;
  uid: string;
  user_id?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface NFCCardListResponse {
  success: boolean;
  data: NFCCardResponse[];
  detail?: string;
}

export interface NFCCardCreateResponse {
  success: boolean;
  data: NFCCardResponse;
  detail?: string;
}

export interface NFCCardError {
  success: boolean;
  detail: string;
}

// Service response types
export interface NFCCardServiceResponse {
  success: boolean;
  data?: NFCCardResponse;
  error?: string;
}