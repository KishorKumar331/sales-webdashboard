import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthProvider = ({ children }) => {
  // This component ensures that useAuth is called within the Router context
  // and provides the auth context to its children
  useAuth(); // Initialize auth state
  
  return <>{children}</>;
};

export default AuthProvider;
