import { useAuthContext } from '../context/AuthContext';

export const useUserActions = () => {
  const { logout, user } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    handleLogout,
  };
};
