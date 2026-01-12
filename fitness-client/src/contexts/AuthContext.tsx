import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiClient } from '../api/ApiClient';
import {
  BookingsService,
  ClientSubscriptionsService,
  CoachesService,
  CoachSlotsService,
  GymSlotsService,
  GymsService,
  ProgramsService,
  SubscriptionPlansService,
  AuthService
} from '../api/services';
import { AuthSuccessResponse, LoginRequest, RegisterRequest, User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  services: {
    auth: AuthService;
    gyms: GymsService;
    gymSlots: GymSlotsService;
    programs: ProgramsService;
    subscriptionPlans: SubscriptionPlansService;
    coaches: CoachesService;
    coachSlots: CoachSlotsService;
    clientSubscriptions: ClientSubscriptionsService;
    bookings: BookingsService;
  };
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN_KEY = 'fitness-auth-token';
const STORAGE_USER_KEY = 'fitness-auth-user';
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.example.com');

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenRef = useRef<string | null>(token);
  const apiClientRef = useRef<ApiClient>();

  if (!apiClientRef.current) {
    apiClientRef.current = new ApiClient(API_BASE_URL, () => tokenRef.current);
  }

  useEffect(() => {
    tokenRef.current = token;
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  const services = useMemo(
    () => ({
      auth: new AuthService(apiClientRef.current!),
      gyms: new GymsService(apiClientRef.current!),
      gymSlots: new GymSlotsService(apiClientRef.current!),
      programs: new ProgramsService(apiClientRef.current!),
      subscriptionPlans: new SubscriptionPlansService(apiClientRef.current!),
      coaches: new CoachesService(apiClientRef.current!),
      coachSlots: new CoachSlotsService(apiClientRef.current!),
      clientSubscriptions: new ClientSubscriptionsService(apiClientRef.current!),
      bookings: new BookingsService(apiClientRef.current!)
    }),
    []
  );

  const handleAuthSuccess = (response: AuthSuccessResponse) => {
    setToken(response.token);
    setUser(response.user);
  };

  const sanitizeUserPayload = <T extends Record<string, unknown>>(payload: T): T => {
    const copy: Record<string, unknown> = { ...payload };
    Object.keys(copy).forEach((key) => {
      const value = copy[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          delete copy[key];
        } else {
          copy[key] = trimmed;
        }
      }
    });
    return copy as T;
  };

  const register = async (payload: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await services.auth.register({
        user: sanitizeUserPayload(payload.user)
      });
      handleAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await services.auth.login({
        user: sanitizeUserPayload(payload.user)
      });
      handleAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await services.auth.logout();
    } catch (err) {
      // игнорируем для локального выхода
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    error,
    services,
    login,
    register,
    logout,
    resetError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return ctx;
};


