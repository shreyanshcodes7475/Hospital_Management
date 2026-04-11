import { createContext, useState, useCallback, useContext } from 'react';

export const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback((userData, type) => {
    setUser(userData);
    setUserType(type);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }, []);

  const checkAuth = useCallback(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((userData, type) => {
    setUser(userData);
    setUserType(type);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        error,
        login,
        logout,
        signup,
        checkAuth,
        setLoading,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
