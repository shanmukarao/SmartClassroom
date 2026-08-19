import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { mockAuthService, getUsers } from '../services/mockDataService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sih_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sih_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('sih_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sih_token', newToken);
    localStorage.setItem('sih_user', JSON.stringify(newUser));
    return newUser;
  };

  const demoLogin = async (role) => {
    let email = 'student@example.com';
    let password = 'student123';

    if (role === 'teacher') {
      email = 'teacher@example.com';
      password = 'teacher123';
    } else if (role === 'admin') {
      email = 'admin@example.com';
      password = 'admin123';
    }

    return await login(email, password, role);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_user');
    mockAuthService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
