import { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch (err) {
      console.error('Error parsing stored user:', err)
      localStorage.removeItem('user')
      return null
    }
  })

  const [userType, setUserType] = useState(() => {
    try {
      return localStorage.getItem('userType') || null
    } catch (err) {
      localStorage.removeItem('userType')
      return null
    }
  })

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null
    } catch (err) {
      localStorage.removeItem('token')
      return null
    }
  })

  const login = (userData, userTypeValue, authToken = null) => {
    setUser(userData)
    setUserType(userTypeValue)
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('userType', userTypeValue || 'patient')
    
    if (authToken) {
      setToken(authToken)
      localStorage.setItem('token', authToken)
    }
  }

  const logout = async () => {
    try {
      // Call logout API
      await fetch('http://localhost:3000/api/users/logout', {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    setUser(null);
    setUserType(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
  };

  const signup = (userData, userTypeValue, authToken = null) => {
    login(userData, userTypeValue, authToken);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userType, login, logout, signup, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
