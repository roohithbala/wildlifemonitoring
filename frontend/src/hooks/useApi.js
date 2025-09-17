import { useState, useCallback, useEffect } from 'react';
import { analyticsAPI, detectionAPI, userAPI, authAPI, handleApiError } from '../utils/api';

/**
 * Generic API hook with loading and error states
 */
export const useApi = (apiCall, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result.data || result);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return { data, loading, error, execute, reset };
};

/**
 * Hook for analytics dashboard data
 */
export const useAnalytics = (timeframe = '30d') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (period = timeframe) => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getDashboard(period);
      setData(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAnalytics,
    setTimeframe: fetchAnalytics 
  };
};

export default { useApi, useAnalytics };
