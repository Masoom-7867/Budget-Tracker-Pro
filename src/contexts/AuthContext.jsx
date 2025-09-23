import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ✅ REQUIRED: Separate async operations object
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', userId)
          ?.single();
        if (!error && data) {
          setUserProfile(data);
        }
      } catch (error) {
        if (error?.message?.includes('Failed to fetch')) {
          // Network error - don't log as bug
          return;
        }
        console.error('JavaScript error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // ✅ REQUIRED: Protected auth handlers
  const authStateHandlers = {
    // CRITICAL: This MUST remain synchronous
    onChange: (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id); // Fire-and-forget
      } else {
        profileOperations?.clear();
      }
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth?.getSession();
        if (error) {
          // Supabase handled the request, show error to user
          console.log('Session error:', error?.message);
          return;
        }
        authStateHandlers?.onChange(null, session);
      } catch (error) {
        if (error?.message?.includes('Failed to fetch')) {
          console.log('Cannot connect to authentication service. Your Supabase project may be paused.');
          return;
        }
        console.error('JavaScript error getting session:', error);
      }
    };

    getInitialSession();

    // PROTECTED: Never modify this callback signature
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, additionalData = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      });

      if (error) {
        throw error;
      }

      return { user: data?.user, session: data?.session };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to authentication service. Please check your connection.');
      }
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { user: data?.user, session: data?.session };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to authentication service. Please check your connection.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to authentication service. Please check your connection.');
      }
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
