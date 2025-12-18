import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (persisted in localStorage for now since API is stateless/sessionless in this context)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // In a real app we would POST /login.
    // Here we GET /api/user/{username} to verify credentials as a workaround.
    try {
      const response = await fetch(`/api/user/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      
      // EXTREMELY INSECURE: Comparing plain text/hashed password on client side.
      // This is only because backend lacks a proper login endpoint.
      if (data.password === password) { // Assuming simple equality for now
         const userData = {
            id: data.id,
            username: data.username,
            role: data.role
         };
         setUser(userData);
         localStorage.setItem('user', JSON.stringify(userData));
         return true;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (userData) => {
      try {
          const response = await fetch('/api/user/register', {
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
          return await response.text();
      } catch (error) {
          console.error("Signup error:", error);
          throw error;
      }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
