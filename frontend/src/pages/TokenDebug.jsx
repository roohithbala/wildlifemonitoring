import React, { useState } from 'react';

const TokenDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');
  
  const clearTokens = () => {
    try {
      const oldToken = localStorage.getItem('token');
      const oldUser = localStorage.getItem('user');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.clear(); // Clear everything
      
      setDebugInfo(`
Tokens cleared successfully!

Previous token: ${oldToken ? oldToken.substring(0, 50) + '...' : 'none'}
Previous user: ${oldUser ? JSON.parse(oldUser).email : 'none'}

✅ localStorage cleared
✅ Ready for fresh login
      `);
    } catch (error) {
      setDebugInfo(`Error clearing tokens: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      setDebugInfo('Testing login...\n\nChecking network connectivity...');
      
      // First test basic connectivity
      const healthResponse = await fetch('http://localhost:5001/api/health', {
        method: 'GET',
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      setDebugInfo('✅ Backend connectivity OK\n\nTesting login...');
      
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@wildlifemonitor.com',
          password: 'demo123'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setDebugInfo(`
✅ Login successful!

User: ${data.data.user.firstName} ${data.data.user.lastName}
Email: ${data.data.user.email}
Role: ${data.data.user.role}
Token: ${data.data.token.substring(0, 50)}...

Token stored in localStorage

🎉 You can now go to http://localhost:5173 and you should be logged in!
        `);
      } else {
        setDebugInfo(`❌ Login failed: ${data.message}`);
      }
    } catch (error) {
      setDebugInfo(`
❌ Login error: ${error.message}

Possible causes:
1. Backend server not running on port 5001
2. Network connectivity issues
3. CORS configuration problems
4. Firewall blocking the connection

Try:
1. Check if backend is running: http://localhost:5001/api/health
2. Restart servers using complete-token-fix.bat
3. Check browser console for detailed errors
      `);
    }
  };

  const checkCurrentTokens = () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      setDebugInfo(`
Current localStorage state:

Token: ${token ? token.substring(0, 50) + '...' : 'NOT FOUND'}
Token length: ${token ? token.length + ' characters' : 'N/A'}

User: ${user ? JSON.parse(user).email : 'NOT FOUND'}

All localStorage keys: ${Object.keys(localStorage).join(', ') || 'none'}
      `);
    } catch (error) {
      setDebugInfo(`Error checking tokens: ${error.message}`);
    }
  };

  const testTokenVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDebugInfo('❌ No token found in localStorage');
        return;
      }

      setDebugInfo('Testing token verification...');
      
      const response = await fetch('http://localhost:5001/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDebugInfo(`
✅ Token verification successful!

User: ${data.data.user.firstName} ${data.data.user.lastName}
Email: ${data.data.user.email}
Role: ${data.data.user.role}
        `);
      } else {
        setDebugInfo(`❌ Token verification failed: ${data.message}`);
      }
    } catch (error) {
      setDebugInfo(`❌ Token verification error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Token Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={clearTokens}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            🗑️ Clear All Tokens
          </button>
          
          <button
            onClick={checkCurrentTokens}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            🔍 Check Current Tokens
          </button>
          
          <button
            onClick={testLogin}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            🔑 Test Login
          </button>
          
          <button
            onClick={testTokenVerification}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            ✅ Test Token Verification
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded border text-sm overflow-auto whitespace-pre-wrap">
            {debugInfo || 'Click a button above to start debugging...'}
          </pre>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How to fix "Invalid Token" errors:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Click "Clear All Tokens" to remove any old/invalid tokens</li>
            <li>Click "Test Login" to get a fresh token</li>
            <li>Click "Test Token Verification" to confirm it works</li>
            <li>If all tests pass, refresh the page and try logging in normally</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TokenDebug;