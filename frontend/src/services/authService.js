import { loginUser, registerUser, logoutUser, resetPassword, getCurrentUser, updateUserProfile } from '../supabase/auth';

export const login = async (email, password) => {
  return await loginUser(email, password);
};

export const register = async (email, password, displayName, role, departmentId = null, pendingApproval = false) => {
  const user = await registerUser(email, password, displayName, role, departmentId, pendingApproval);
  
  return user;
};

export const logout = async () => {
  return await logoutUser();
};

export const forgotPassword = async (email) => {
  return await resetPassword(email);
};

export const verifyResetToken = async (token) => {
  const { verifyPasswordResetToken } = await import('../supabase/auth');
  return await verifyPasswordResetToken(token);
};

export const resetPasswordWithToken = async (token, newPassword) => {
  const { updatePasswordWithToken } = await import('../supabase/auth');
  return await updatePasswordWithToken(token, newPassword);
};

export const getCurrentUserProfile = async () => {
  return await getCurrentUser();
};

export const updateProfile = async (userId, updates) => {
  return await updateUserProfile(userId, updates);
};