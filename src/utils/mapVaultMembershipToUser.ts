import { VaultMembershipResponse, User, UserRole, UserStatus } from '../types/UserTypes';

/**
 * Utility function to map a backend `VaultMembershipResponse`
 * into a frontend `User` object suitable for components like UserItem.
 */
export function mapVaultMembershipToUser(member: VaultMembershipResponse): User {
  const role: UserRole = member.role === 'admin' ? 'admin' : 'user';
  const status: UserStatus = 'active';

  return {
    id: member.user_id,
    firstName: member.first_name ?? undefined,
    lastName: member.last_name ?? undefined,
    username: member.username ?? undefined,
    role,
    status,
    lastAccess: member.created_at,
    enabled: true,
  };
}