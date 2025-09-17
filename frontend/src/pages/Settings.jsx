import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Monitor, 
  Database,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Camera,
  Brain
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    user: {
      name: 'Wildlife Researcher',
      email: 'researcher@wildlife.org',
      role: 'Researcher',
      notifications: true,
      language: 'en'
    },
    detection: {
      autoDetection: true,
      confidenceThreshold: 0.7,
      detectionMode: 'web',
      saveResults: true,
      modelQuality: 'high'
    },
    system: {
      theme: 'light',
      autoBackup: true,
      dataRetention: 90,
      maxFileSize: 10,
      apiTimeout: 30
    },
    privacy: {
      shareData: false,
      analytics: true,
      locationTracking: false,
      errorReporting: true
    }
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save to backend here
      console.log('Saving settings:', settings);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      user: {
        name: 'Wildlife Researcher',
        email: 'researcher@wildlife.org',
        role: 'Researcher',
        notifications: true,
        language: 'en'
      },
      detection: {
        autoDetection: true,
        confidenceThreshold: 0.7,
        detectionMode: 'web',
        saveResults: true,
        modelQuality: 'high'
      },
      system: {
        theme: 'light',
        autoBackup: true,
        dataRetention: 90,
        maxFileSize: 10,
        apiTimeout: 30
      },
      privacy: {
        shareData: false,
        analytics: true,
        locationTracking: false,
        errorReporting: true
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your wildlife detection system</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {saveStatus && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              saveStatus === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm">
                {saveStatus === 'success' ? 'Settings saved!' : 'Save failed!'}
              </span>
            </div>
          )}
          
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Reset
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={settings.user.name}
                onChange={(e) => handleInputChange('user', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.user.email}
                onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={settings.user.role}
                onChange={(e) => handleInputChange('user', 'role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Researcher">Researcher</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.user.notifications}
                  onChange={(e) => handleInputChange('user', 'notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Detection Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Brain className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Detection Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Detection</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.detection.autoDetection}
                  onChange={(e) => handleInputChange('detection', 'autoDetection', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence Threshold: {(settings.detection.confidenceThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.detection.confidenceThreshold}
                onChange={(e) => handleInputChange('detection', 'confidenceThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detection Mode</label>
              <select
                value={settings.detection.detectionMode}
                onChange={(e) => handleInputChange('detection', 'detectionMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="web">Web (Local)</option>
                <option value="server">Server (Cloud)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Quality</label>
              <select
                value={settings.detection.modelQuality}
                onChange={(e) => handleInputChange('detection', 'modelQuality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">High Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="fast">Fast Processing</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Monitor className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={settings.system.theme}
                onChange={(e) => handleInputChange('system', 'theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Retention (days): {settings.system.dataRetention}
              </label>
              <input
                type="range"
                min="30"
                max="365"
                step="30"
                value={settings.system.dataRetention}
                onChange={(e) => handleInputChange('system', 'dataRetention', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max File Size (MB): {settings.system.maxFileSize}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={settings.system.maxFileSize}
                onChange={(e) => handleInputChange('system', 'maxFileSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Backup</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.system.autoBackup}
                  onChange={(e) => handleInputChange('system', 'autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Share Anonymous Data</label>
                <p className="text-xs text-gray-500">Help improve the system</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.shareData}
                  onChange={(e) => handleInputChange('privacy', 'shareData', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Usage Analytics</label>
                <p className="text-xs text-gray-500">Track system usage</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.analytics}
                  onChange={(e) => handleInputChange('privacy', 'analytics', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Location Tracking</label>
                <p className="text-xs text-gray-500">GPS data for detections</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.locationTracking}
                  onChange={(e) => handleInputChange('privacy', 'locationTracking', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Error Reporting</label>
                <p className="text-xs text-gray-500">Send error logs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.errorReporting}
                  onChange={(e) => handleInputChange('privacy', 'errorReporting', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Version:</span>
            <span className="ml-2 text-gray-600">v2.1.0</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Models Loaded:</span>
            <span className="ml-2 text-gray-600">6/6</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Species Database:</span>
            <span className="ml-2 text-gray-600">15 species</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Backup:</span>
            <span className="ml-2 text-gray-600">2 hours ago</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Storage Used:</span>
            <span className="ml-2 text-gray-600">2.3 GB</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Server Status:</span>
            <span className="ml-2 text-green-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;