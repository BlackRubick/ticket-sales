import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../config/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem(STORAGE_KEYS.auth_token);
    const userData = localStorage.getItem(STORAGE_KEYS.user_data);

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } catch (error) {
        localStorage.clear();
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.login(credentials);
      
      localStorage.setItem(STORAGE_KEYS.auth_token, response.token);
      localStorage.setItem(STORAGE_KEYS.user_data, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.refresh_token, response.refreshToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message || 'Error de autenticación' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.auth_token);
    localStorage.removeItem(STORAGE_KEYS.user_data);
    localStorage.removeItem(STORAGE_KEYS.refresh_token);
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    login,
    logout,
    isLoading: state.isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
