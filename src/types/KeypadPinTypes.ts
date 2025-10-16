export interface KeypadPin {
    id: number;
    pin_code: string;
    user_id?: number;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;

    // User information for UI display (populated when user_id exists)
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  }
  
  export interface CreateKeypadPinRequest {
    pin_code: string;
    user_id?: number;
    vault_id?: number;
  }
  
  export interface KeypadPinResponse {
    success: boolean;
    data: KeypadPin;
    detail: string;
  }
  