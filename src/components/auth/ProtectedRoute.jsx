import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {authView === 'login' ? (
          <LoginForm onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;