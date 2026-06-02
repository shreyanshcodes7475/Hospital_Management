import { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('userType');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setUserType(storedUserType);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    }
  }, []);

  const login = (userData, userTypeValue, authToken = null) => {
    setUser(userData);
    setUserType(userTypeValue);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', userTypeValue);
    
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
  };

  const logout = () => {
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
