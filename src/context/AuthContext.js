import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { getCurrentUser } from '../supabase/auth';

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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          const userWithRole = await getCurrentUser();
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: userWithRole
          });
        } catch (error) {
          console.error('Error fetching user role:', error);
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: session.user
          });
        }
      } else {
        dispatch({
          type: 'AUTH_STATE_CHANGED',
          payload: null
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const userWithRole = await getCurrentUser();
            dispatch({
              type: 'AUTH_STATE_CHANGED',
              payload: userWithRole
            });
          } catch (error) {
            console.error('Error fetching user role:', error);
            dispatch({
              type: 'AUTH_STATE_CHANGED',
              payload: session.user
            });
          }
        } else {
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: null
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Role checking helpers
  const isAdmin = () => state.role === 'admin';
  const isDepartmentHead = () => state.role === 'department_head';
  const isUser = () => state.role === 'user';
  const isGuest = () => !state.isAuthenticated;

  return (
    <AuthContext.Provider value={{
      ...state,
      isAdmin,
      isDepartmentHead,
      isUser,
      isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};