/**
 * Session utilities are now managed server-side
 * This file is kept for backward compatibility but all functions are deprecated
 */

console.warn('sessionUtils.js is deprecated - session management is now handled by the Express backend');

// Deprecated exports for backward compatibility
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const isSessionValid = () => {
    console.warn('isSessionValid is deprecated - session validation is now server-side');
    return { valid: true, reason: 'deprecated' };
};

export const updateActivity = () => {
    console.warn('updateActivity is deprecated - use activity tracking in AuthContext');
};

export const clearSessionData = () => {
    console.warn('clearSessionData is deprecated - sessions are managed server-side with HttpOnly cookies');
};

export const initializeSession = () => {
    console.warn('initializeSession is deprecated - sessions are created server-side on login');
};

export default {
    SESSION_DURATION,
    INACTIVITY_TIMEOUT,
    isSessionValid,
    updateActivity,
    clearSessionData,
    initializeSession
};
