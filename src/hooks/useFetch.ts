import { useState, useEffect, useCallback } from 'react';
import { errorUtils } from '../utils';

interface UseFetchOptions {
  skip?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) => {
  const { skip = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const message = errorUtils.getErrorMessage(err);
      setError(message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (!skip) {
      execute();
    }
  }, [skip, execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
};
