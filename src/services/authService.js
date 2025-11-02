import { loginUser, registerUser, logoutUser, resetPassword, getCurrentUser, updateUserProfile } from '../supabase/auth';

export const login = async (email, password) => {
  return await loginUser(email, password);
};

export const register = async (email, password, displayName, role) => {
  return await registerUser(email, password, displayName, role);
};

export const logout = async () => {
  return await logoutUser();
};

export const forgotPassword = async (email) => {
  return await resetPassword(email);
};

export const getCurrentUserProfile = async () => {
  return await getCurrentUser();
};

export const updateProfile = async (userId, updates) => {
  return await updateUserProfile(userId, updates);
};