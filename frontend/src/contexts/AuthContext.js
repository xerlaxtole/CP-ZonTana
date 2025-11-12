import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Use environment variables for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export function useAuth() {
  const a = useContext(AuthContext);
  if (!a) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return a;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Login with username (auto-creates account if doesn't exist)
  async function login(username) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Logout
  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  // Update user avatar
  async function updateAvatar(avatar) {
    try {
      const response = await fetch(`${API_URL}/user/avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ avatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Avatar update failed');
      }

      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const value = {
    currentUser,
    error,
    setError,
    login,
    logout,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
