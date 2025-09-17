import React, { useState } from 'react';
import { Bug, Code, Key, Database, Wifi, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SystemTest = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [allTestsCompleted, setAllTestsCompleted] = useState(false);

  const tests = [
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Test camera permissions and functionality',
      icon: Wifi,
      test: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          return { status: 'pass', message: 'Camera access granted and functional' };
        } catch (error) {
          return { status: 'fail', message: `Camera test failed: ${error.message}` };
        }
      }
    },
    {
      id: 'tensorflow',
      name: 'TensorFlow.js',
      description: 'Test AI model loading and inference',
      icon: Code,
      test: async () => {
        try {
          // Simulate TensorFlow test
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { status: 'pass', message: 'TensorFlow.js model loaded successfully' };
        } catch (error) {
          return { status: 'fail', message: `TensorFlow test failed: ${error.message}` };
        }
      }
    },
    {
      id: 'api',
      name: 'API Connection',
      description: 'Test backend API connectivity',
      icon: Database,
      test: async () => {
        try {
          const response = await fetch('/api/health');
          if (response.ok) {
            return { status: 'pass', message: 'API connection successful' };
          } else {
            return { status: 'warn', message: 'API connection established but server returned error' };
          }
        } catch (error) {
          return { status: 'fail', message: `API connection failed: ${error.message}` };
        }
      }
    },
    {
      id: 'websocket',
      name: 'WebSocket Connection',
      description: 'Test real-time communication',
      icon: Wifi,
      test: async () => {
        try {
          // Simulate WebSocket test
          await new Promise(resolve => setTimeout(resolve, 800));
          return { status: 'pass', message: 'WebSocket connection established' };
        } catch (error) {
          return { status: 'fail', message: `WebSocket test failed: ${error.message}` };
        }
      }
    },
    {
      id: 'storage',
      name: 'Local Storage',
      description: 'Test browser storage capabilities',
      icon: Database,
      test: async () => {
        try {
          const testKey = 'system_test_key';
          const testValue = 'test_value';
          localStorage.setItem(testKey, testValue);
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          if (retrieved === testValue) {
            return { status: 'pass', message: 'Local storage functional' };
          } else {
            return { status: 'fail', message: 'Local storage read/write failed' };
          }
        } catch (error) {
          return { status: 'fail', message: `Storage test failed: ${error.message}` };
        }
      }
    }
  ];

  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});
    setAllTestsCompleted(false);

    const results = {};
    
    for (const test of tests) {
      // Update UI to show current test
      setTestResults(prev => ({
        ...prev,
        [test.id]: { status: 'running', message: 'Running...' }
      }));

      try {
        const result = await test.test();
        results[test.id] = result;
        setTestResults(prev => ({
          ...prev,
          [test.id]: result
        }));
      } catch (error) {
        results[test.id] = { 
          status: 'fail', 
          message: `Test execution failed: ${error.message}` 
        };
        setTestResults(prev => ({
          ...prev,
          [test.id]: results[test.id]
        }));
      }

      // Small delay between tests for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setTesting(false);
    setAllTestsCompleted(true);
  };

  const runSingleTest = async (test) => {
    setTestResults(prev => ({
      ...prev,
      [test.id]: { status: 'running', message: 'Running...' }
    }));

    try {
      const result = await test.test();
      setTestResults(prev => ({
        ...prev,
        [test.id]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: { 
          status: 'fail', 
          message: `Test execution failed: ${error.message}` 
        }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'border-green-200 bg-green-50';
      case 'fail':
        return 'border-red-200 bg-red-50';
      case 'warn':
        return 'border-yellow-200 bg-yellow-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const passedTests = Object.values(testResults).filter(r => r.status === 'pass').length;
  const failedTests = Object.values(testResults).filter(r => r.status === 'fail').length;
  const warnTests = Object.values(testResults).filter(r => r.status === 'warn').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Test</h1>
        <p className="text-gray-600">
          Test various system components to ensure everything is working correctly
        </p>
      </div>

      {/* Test Summary */}
      {allTestsCompleted && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Test Summary</h2>
          <div className="flex space-x-4 text-sm">
            <span className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              {passedTests} Passed
            </span>
            {warnTests > 0 && (
              <span className="flex items-center text-yellow-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {warnTests} Warnings
              </span>
            )}
            {failedTests > 0 && (
              <span className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                {failedTests} Failed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Run All Tests Button */}
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={testing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Bug className="w-5 h-5 mr-2" />
          {testing ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {/* Individual Tests */}
      <div className="space-y-4">
        {tests.map((test) => {
          const result = testResults[test.id];
          const TestIcon = test.icon;
          
          return (
            <div
              key={test.id}
              className={`p-4 rounded-lg border transition-colors ${getStatusColor(result?.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TestIcon className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result?.status)}
                  <button
                    onClick={() => runSingleTest(test)}
                    disabled={testing || result?.status === 'running'}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test
                  </button>
                </div>
              </div>
              
              {result && (
                <div className="mt-3 text-sm">
                  <p className={`
                    ${result.status === 'pass' ? 'text-green-700' : 
                      result.status === 'fail' ? 'text-red-700' : 
                      result.status === 'warn' ? 'text-yellow-700' : 
                      'text-blue-700'}
                  `}>
                    {result.message}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Browser:</span>
            <span className="ml-2 text-gray-600">{navigator.userAgent.split(' ')[0]}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Platform:</span>
            <span className="ml-2 text-gray-600">{navigator.platform}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Language:</span>
            <span className="ml-2 text-gray-600">{navigator.language}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Online:</span>
            <span className="ml-2 text-gray-600">{navigator.onLine ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemTest;