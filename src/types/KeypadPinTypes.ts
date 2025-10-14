export interface KeypadPin {
    id: number;
    pin_code: string;
    user_id?: number;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  }
  
  export interface CreateKeypadPinRequest {
    pin_code: string;
    user_id?: number;
  }
  
  export interface KeypadPinResponse {
    success: boolean;
    data: KeypadPin;
    detail: string;
  }
  