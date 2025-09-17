import React, { useState } from 'react';
import { Camera, Bell, User, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-nature-500 to-nature-600 p-2 rounded-xl shadow-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-nature-700 to-nature-600 bg-clip-text text-transparent">
                  Wildlife Monitor
                </span>
                <p className="text-xs text-gray-500 font-medium">Real-time Detection System</p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search detections..." 
                className="bg-transparent outline-none text-sm flex-1 text-gray-700 placeholder-gray-400"
              />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button className="p-2.5 text-gray-400 hover:text-nature-600 hover:bg-nature-50 rounded-full transition-all duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user ? `${user.firstName || user.username || 'User'} ${user.lastName || ''}`.trim() : 'Wildlife Admin'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.organization || user?.role || 'System Manager'}
                    {user?.isDemo && ' (Demo)'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 p-2.5 text-gray-400 hover:text-nature-600 hover:bg-nature-50 rounded-full transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-nature-500 to-nature-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user ? `${user.firstName || user.username || 'User'} ${user.lastName || ''}`.trim() : 'Wildlife Admin'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email || 'admin@wildlifemonitor.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;