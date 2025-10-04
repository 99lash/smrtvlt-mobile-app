export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string;
  enabled: boolean;
}

// Helper function to get display name
export const getUserDisplayName = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || `User ${user.id}`;
};

// Registration types
export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface UserRegistrationResponse {
  success: boolean;
  data: User;
  detail: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface VaultMembershipResponse {
  id: number;
  user_id: number;
  vault_id: number;
  role: string;
  created_at: string;
  updated_at: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface VaultMembersResponse {
  success: boolean;
  data: VaultMembershipResponse[];
  detail?: string;
}

export interface UsersScreenNavigationProp {
  navigate: (screen: string, params?: { userId: string }) => void;
}

export interface UsersScreenProps {
  navigation: UsersScreenNavigationProp;
}

export interface BadgeVariant {
  default: 'default';
  secondary: 'secondary';
}

export type BadgeVariantType = BadgeVariant[keyof BadgeVariant];

export interface BadgeProps {
  label: string;
  variant?: BadgeVariantType;
}

export interface UserItemProps {
  user: User;
  onToggleEnabled: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onPress: (userId: string) => void;
}

export interface UserManagementHookReturn {
  users: User[];
  sortedUsers: User[];
  isLoading: boolean;
  error: string | null;
  toggleUserEnabled: (userId: string) => void;
  removeUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;
}