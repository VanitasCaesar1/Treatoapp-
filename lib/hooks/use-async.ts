'use client';

import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Handle async operations with loading/error states
 */
export function useAsync<T>() {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    });

    try {
      const data = await asyncFunction();
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
      return data;
    } catch (error) {
      setState({
        data: null,
        error: error as Error,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return { ...state, execute, reset };
}
