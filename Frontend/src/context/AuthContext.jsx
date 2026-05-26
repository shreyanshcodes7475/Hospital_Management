import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData, userType) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const signup = (userData, userType) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
