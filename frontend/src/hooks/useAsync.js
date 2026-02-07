import { useState, useCallback } from 'react';

/**
 * Custom hook for handling async operations with loading and error states
 */
export const useAsync = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...params) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...params);
        setData(result);
        return result;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, loading, error, data, setData };
};

export default useAsync;
