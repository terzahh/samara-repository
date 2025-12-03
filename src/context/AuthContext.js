import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_STATE_CHANGED':
      return {
        ...state,
        isAuthenticated: !!action.payload,
        user: action.payload,
        role: action.payload ? action.payload.role : null,
        departmentId: action.payload ? action.payload.departmentId : null,
        departmentName: action.payload ? action.payload.departmentName : null,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  departmentId: null,
  departmentName: null,
  loading: true
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const bcRef = useRef(null);
  const activityTimerRef = useRef(null);

  // Fetch current user from backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include' // Send cookies
        });

        if (response.ok) {
          const { user } = await response.json();
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: user
          });
        } else {
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: null
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        dispatch({
          type: 'AUTH_STATE_CHANGED',
          payload: null
        });
      }
    };

    fetchUser();

    // Set up BroadcastChannel for multi-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      bcRef.current = new BroadcastChannel('ir-auth');

      bcRef.current.onmessage = (event) => {
        if (event.data === 'logout') {
          // Another tab logged out
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: null
          });
        } else if (event.data.type === 'login' && event.data.user) {
          // Another tab logged in
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: event.data.user
          });
        }
      };
    }

    return () => {
      if (bcRef.current) {
        bcRef.current.close();
      }
    };
  }, []);

  // Activity tracking - ping server periodically
  useEffect(() => {
    if (!state.isAuthenticated) {
      // Clear timer if not authenticated
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
        activityTimerRef.current = null;
      }
      return;
    }

    // Ping server every 5 minutes to keep session active
    const pingServer = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/auth/ping');
      } else {
        fetch('/api/auth/ping', {
          method: 'POST',
          credentials: 'include',
          keepalive: true
        }).catch(() => {
          // Ignore errors - ping is best-effort
        });
      }
    };

    // Initial ping
    pingServer();

    // Set up interval
    activityTimerRef.current = setInterval(pingServer, 5 * 60 * 1000); // 5 minutes

    // Track user activity events
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    let lastPing = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Throttle pings to once per minute
      if (now - lastPing > 60000) {
        lastPing = now;
        pingServer();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [state.isAuthenticated]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const { user } = await response.json();

      dispatch({
        type: 'AUTH_STATE_CHANGED',
        payload: user
      });

      // Notify other tabs
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'login', user });
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Get CSRF token from cookie
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      dispatch({
        type: 'AUTH_STATE_CHANGED',
        payload: null
      });

      // Notify other tabs
      if (bcRef.current) {
        bcRef.current.postMessage('logout');
      }
    }
  }, []);

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const { user } = await response.json();
        dispatch({
          type: 'AUTH_STATE_CHANGED',
          payload: user
        });
        return user;
      } else {
        dispatch({
          type: 'AUTH_STATE_CHANGED',
          payload: null
        });
        return null;
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      return null;
    }
  }, []);

  // Role check helpers
  const isAdmin = useCallback(() => {
    return state.role === 'admin';
  }, [state.role]);

  const isDepartmentHead = useCallback(() => {
    return state.role === 'department_head';
  }, [state.role]);

  const isUser = useCallback(() => {
    return state.role === 'user';
  }, [state.role]);

  const isGuest = useCallback(() => {
    return state.role === 'guest';
  }, [state.role]);

  const value = {
    ...state,
    login,
    logout,
    refreshAuth,
    isAdmin,
    isDepartmentHead,
    isUser,
    isGuest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};