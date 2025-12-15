import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as AppUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<AppUser> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          const metadata = session.user.user_metadata;
          const appUser: AppUser = {
            id: session.user.id,
            username: metadata.username || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            programme: metadata.programme || 'B.TECH',
            branch: metadata.branch || 'CSE',
            year: metadata.year || '1st Year',
            passingYear: metadata.passingYear || '2028',
            mobileNumber: metadata.mobileNumber,
            points: metadata.points || 0,
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        const metadata = session.user.user_metadata;
        const appUser: AppUser = {
          id: session.user.id,
          username: metadata.username || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          programme: metadata.programme || 'B.TECH',
          branch: metadata.branch || 'CSE',
          year: metadata.year || '1st Year',
          passingYear: metadata.passingYear || '2028',
          mobileNumber: metadata.mobileNumber,
          points: metadata.points || 0,
        };
        setUser(appUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate KIIT email format
    const emailRegex = /^[a-zA-Z0-9]+@kiit\.ac\.in$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please use a valid KIIT email (e.g., 23051118@kiit.ac.in)');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, digit, and special character');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return !!data.user;
  };

  const signup = async (userData: Partial<AppUser> & { password: string }): Promise<boolean> => {
    // Validate KIIT email format
    const emailRegex = /^[a-zA-Z0-9]+@kiit\.ac\.in$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      throw new Error('Please use a valid KIIT email (e.g., 23051118@kiit.ac.in)');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, digit, and special character');
    }

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: userData.username || userData.email.split('@')[0],
          programme: userData.programme || 'B.TECH',
          branch: userData.branch || 'CSE',
          year: userData.year || '1st Year',
          passingYear: userData.passingYear || '2028',
          mobileNumber: userData.mobileNumber,
          points: 0,
        },
      },
    });

    if (error) throw error;
    return !!data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      session,
      isAuthenticated: !!session, 
      loading,
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
