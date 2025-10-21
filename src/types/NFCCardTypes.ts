export interface NFCCard {
  nfc_card_id: number;
  nfc_card_uid: string;
  nfc_card_name?: string;
  user_id?: number;
  vault_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface NFCCardRegistrationRequest {
  uid: string;
  user_id: number;
  vault_id?: number;
  name?: string;
}

export interface NFCCardCreateRequest {
  uid: string;
  user_id?: number;
  vault_id: number;
  name?: string;
}

export interface NFCCardResponse {
  success: boolean;
  data: NFCCard;
  detail?: string;
}

export interface NFCCardCreateResponse {
  success: boolean;
  data: NFCCard;
  detail?: string;
}

export interface NFCCardServiceResponse {
  success: boolean;
  data?: NFCCard;
  error?: string;
}

export interface NFCCardWithUserResponse {
  nfc_card_id: number;
  nfc_card_uid: string;
  nfc_card_name?: string;
  user_id?: number;
  vault_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface NFCCardRegistrationResponse {
  success: boolean;
  data?: NFCCard;
  error?: string;
}

export interface NFCCardListResponse {
  success: boolean;
  data?: NFCCard[];
  error?: string;
}

export interface NFCCardDeleteResponse {
  success: boolean;
  error?: string;
}

export interface NFCManagerState {
  nfcCards: NFCCard[];
  loading: boolean;
  error: string | null;
  deletingCardId: number | null;
}

export interface NFCRegistrationState {
  loading: boolean;
  error: string | null;
  cardName: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  token?: string;
  error?: string;
}