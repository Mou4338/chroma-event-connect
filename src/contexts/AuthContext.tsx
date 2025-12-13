import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

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

    // Simulated login - in production, this would call an API
    const mockUser: User = {
      id: '1',
      username: email.split('@')[0],
      email,
      programme: 'B.TECH',
      branch: 'CSE',
      year: '2nd Year',
      passingYear: '2027',
      points: 1250,
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return true;
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
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

    // Simulated signup
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      programme: userData.programme || 'B.TECH',
      branch: userData.branch || 'CSE',
      year: userData.year || '1st Year',
      passingYear: userData.passingYear || '2028',
      mobileNumber: userData.mobileNumber,
      points: 0,
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
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
