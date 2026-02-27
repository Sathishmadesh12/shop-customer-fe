import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('sf_token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sf_token');
      if (storedToken) {
        try {
          const res = await authService.getProfile();
          setUser(res.data.data);
        } catch {
          localStorage.removeItem('sf_token');
          localStorage.removeItem('sf_user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('sf_token', newToken);
    localStorage.setItem('sf_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('sf_token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
    localStorage.setItem('sf_user', JSON.stringify({ ...user, ...updated }));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;
