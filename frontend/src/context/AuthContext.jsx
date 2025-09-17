import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage)
    const savedUser = localStorage.getItem('wildlife_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('wildlife_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Mock login - replace with actual API call
      const mockUser = {
        id: '1',
        email: credentials.email,
        username: credentials.username || credentials.email.split('@')[0],
        firstName: 'Wildlife',
        lastName: 'Admin',
        role: 'Admin',
        organization: 'Wildlife Monitoring',
        isDemo: true
      };
      
      setUser(mockUser);
      localStorage.setItem('wildlife_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration - replace with actual API call
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'User',
        organization: userData.organization || 'Wildlife Monitoring',
        isDemo: true
      };
      
      setUser(newUser);
      localStorage.setItem('wildlife_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wildlife_user');
    localStorage.removeItem('wildlife_token');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('wildlife_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;