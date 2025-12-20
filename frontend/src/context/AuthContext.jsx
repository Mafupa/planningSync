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

      if (token === '2FA_REQUIRED') {
         return { status: '2FA_REQUIRED', username };
      }

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
      if(userData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      return { status: 'SUCCESS' };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const verify2FA = async (username, otp) => {
      try {
        const response = await fetch(`/api/user/verify-2fa?username=${username}&otp=${otp}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Invalid OTP');
        }

        const token = await response.text();
        localStorage.setItem('token', token);

        const userResponse = await authFetch(`/api/user/${username}`);
        if (!userResponse.ok) { throw new Error('Failed to fetch user details'); }
        
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
          console.error("2FA Verification error:", error);
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

  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(`/api/user/request-password-reset?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to request password reset');
      }
      return true;
    } catch (error) {
      console.error("Request reset error:", error);
      throw error;
    }
  };

  const resetPassword = async (email, password, otp) => {
    try {
      const response = await fetch(`/api/user/reset-password?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&otp=${encodeURIComponent(otp)}`, {
        method: 'POST'
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to reset password');
      }
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, verify2FA, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
