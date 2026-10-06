import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  idInstance: string;
  apiTokenInstance: string;
  setCredentials: (id: string, token: string) => void;
  clearCredentials: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idInstance, setIdInstance] = useState<string>(
    () => localStorage.getItem('idInstance') || ''
  );
  const [apiTokenInstance, setApiTokenInstance] = useState<string>(
    () => localStorage.getItem('apiTokenInstance') || ''
  );

  const setCredentials = (id: string, token: string) => {
    setIdInstance(id);
    setApiTokenInstance(token);
    localStorage.setItem('idInstance', id);
    localStorage.setItem('apiTokenInstance', token);
  };

  const clearCredentials = () => {
    setIdInstance('');
    setApiTokenInstance('');
    localStorage.removeItem('idInstance');
    localStorage.removeItem('apiTokenInstance');
  };

  return (
    <AuthContext.Provider
      value={{
        idInstance,
        apiTokenInstance,
        setCredentials,
        clearCredentials,
        isAuthenticated: Boolean(idInstance && apiTokenInstance),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
