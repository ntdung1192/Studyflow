import { useCallback, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken, setUnauthorizedHandler } from '../../services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()));

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      setAuthToken(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!getAuthToken()) return undefined;
    let active = true;

    api
      .get('/auth/me')
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        setAuthToken(null);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await api.post('/auth/login', { email, password });
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password, timeZone }) => {
    const payload = { name, email, password };
    if (timeZone) payload.timeZone = timeZone;
    const data = await api.post('/auth/register', payload);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
