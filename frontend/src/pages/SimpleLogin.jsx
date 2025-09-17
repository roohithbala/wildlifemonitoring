import React, { useState } from 'react';

const SimpleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleTestLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const response = await fetch('http://localhost:5001/api/test/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setResult(' Test login successful! Ready to test camera!');
      } else {
        setResult(' Test login failed');
      }
    } catch (error) {
      setResult(' Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Simple Login Test</h1>
        
        <button
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mb-4"
        >
          {loading ? 'Testing...' : 'Quick Test Login'}
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Main App
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLogin;
