import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const loginResponse = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!loginResponse.ok) {
        throw new Error('Invalid credentials');
      }

      const token = await loginResponse.text();

      localStorage.setItem('token', token);

      const userResponse = await authFetch(`/api/user/${username}`);

      if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
      }

      const backendUser = await userResponse.json();
      
      const userData = {
         id: backendUser.id,
         username: backendUser.username,
         role: backendUser.role,
         village: backendUser.village,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (userData) => {
      try {
          const response = await authFetch('/api/user/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
          });
          if (!response.ok) {
              const text = await response.text();
              throw new Error(text || 'Signup failed');
          }
          // login after signup
          await login(userData.username, userData.password);
          return true;
      } catch (error) {
          console.error("Signup error:", error);
          throw error;
      }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
