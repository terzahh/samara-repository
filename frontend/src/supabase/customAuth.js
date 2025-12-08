/**
 * Custom Authentication API Client
 * All authentication now goes through Express backend
 * This file maintains backward compatibility with existing code
 */

const API_URL = process.env.REACT_APP_API_URL || '';
console.log('🔧 API_URL configured as:', API_URL || 'Using relative paths (proxy)');

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Send/receive cookies
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - Display name
 * @param {string} role - User role (optional)
 * @param {string} departmentId - Department ID (optional)
 * @returns {Promise<Object>} User object
 */
export const registerUser = async (email, password, displayName, role = 'user', departmentId = null) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, displayName, role, departmentId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf_token='))
      ?.split('=')[1];

    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken || ''
      },
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw - logout should always succeed locally
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} User object or null
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Update user profile
 * Note: This still uses direct Supabase access
 * TODO: Move to backend API for consistency
 */
export const updateUserProfile = async (userId, updates) => {
  const { supabaseForCustomAuth } = await import('./supabase');

  try {
    const { data, error } = await supabaseForCustomAuth
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Change user password
 * Note: This still uses direct Supabase access
 * TODO: Move to backend API with proper password hashing
 */
export const changePassword = async (userId, newPassword) => {
  const { supabaseForCustomAuth } = await import('./supabase');

  try {
    // Note: Password should be hashed server-side
    // This is a temporary implementation
    const { error } = await supabaseForCustomAuth
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Request password reset
 * Note: This functionality needs to be implemented in backend
 * TODO: Add password reset endpoint to Express backend
 */
export const requestPasswordReset = async (email) => {
  // Placeholder - implement backend endpoint
  console.warn('Password reset not yet implemented with new backend');
  throw new Error('Password reset feature coming soon');
};

/**
 * Reset password with token
 * Note: This functionality needs to be implemented in backend
 * TODO: Add password reset confirmation endpoint
 */
export const resetPassword = async (token, newPassword) => {
  // Placeholder - implement backend endpoint
  console.warn('Password reset not yet implemented with new backend');
  throw new Error('Password reset feature coming soon');
};

// Legacy compatibility exports
export const setSession = () => {
  console.warn('setSession is deprecated - sessions are now managed server-side');
};

export const getSession = async () => {
  console.warn('getSession is deprecated - use getCurrentUser() instead');
  return getCurrentUser();
};

export const clearSession = () => {
  console.warn('clearSession is deprecated - use logoutUser() instead');
  return logoutUser();
};

/**
 * Admin: Generate password reset link
 * TODO: Implement in backend
 */
export const adminGenerateResetLink = async (userId) => {
  console.warn('adminGenerateResetLink not yet implemented with new backend');
  throw new Error('Admin password reset feature coming soon');
};

/**
 * Admin: Reset user password
 */
export const adminResetUserPassword = async (userId, newPassword) => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf_token='))
      ?.split('=')[1];

    const response = await fetch(`${API_URL}/api/auth/admin/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || ''
      },
      credentials: 'include',
      body: JSON.stringify({ userId, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    return await response.json();
  } catch (error) {
    console.error('Admin reset password error:', error);
    throw error;
  }
};

/**
 * Verify password reset token
 * TODO: Implement in backend
 */
export const verifyPasswordResetToken = async (token) => {
  console.warn('verifyPasswordResetToken not yet implemented with new backend');
  throw new Error('Password reset verification coming soon');
};

/**
 * Update password with reset token
 * TODO: Implement in backend
 */
export const updatePasswordWithToken = async (token, newPassword) => {
  console.warn('updatePasswordWithToken not yet implemented with new backend');
  throw new Error('Password reset update coming soon');
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  adminGenerateResetLink,
  adminResetUserPassword,
  verifyPasswordResetToken,
  updatePasswordWithToken
};
