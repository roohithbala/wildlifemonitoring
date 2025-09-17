import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Video, 
  BarChart3, 
  Settings,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
    { name: 'Upload', href: '/upload', icon: Upload, color: 'from-green-500 to-green-600' },
    { name: 'Real-time', href: '/realtime', icon: Video, color: 'from-red-500 to-red-600' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200/60 transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Collapse Toggle */}
      <div className="p-4 border-b border-gray-200/60">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-nature-50 to-nature-100 text-nature-700 shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-lg mr-3 ${isActive ? `bg-gradient-to-r ${item.color}` : 'bg-gray-100 group-hover:bg-gray-200'} transition-all duration-200`}>
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'}`} />
                    </div>
                    {!isCollapsed && (
                      <span className="flex-1 text-left">
                        {item.name}
                      </span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="w-2 h-2 bg-nature-500 rounded-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status Indicator */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200/60">
          <div className="bg-gradient-to-r from-nature-50 to-nature-100 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-nature-700">System Status</p>
                <p className="text-xs text-nature-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;