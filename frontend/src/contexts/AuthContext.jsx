import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dews_token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('dews_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token;
  const isLoading = false;

  const login = (newToken, userInfo = null) => {
    localStorage.setItem('dews_token', newToken);
    setToken(newToken);
    if (userInfo) {
      localStorage.setItem('dews_user', JSON.stringify(userInfo));
      setUser(userInfo);
    }
  };

  const logout = () => {
    localStorage.removeItem('dews_token');
    localStorage.removeItem('dews_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated, isLoading, login, logout }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
