import { useState, useCallback } from 'react';

/**
 * Hook for optimistic updates - makes the app feel instant
 * 
 * Usage:
 * const { data, optimisticUpdate, isUpdating } = useOptimistic(initialData);
 * 
 * // When user taps like:
 * optimisticUpdate(
 *   { ...data, liked: true, likes: data.likes + 1 }, // Optimistic state
 *   async () => await api.likePost(postId) // Actual API call
 * );
 */
export function useOptimistic<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimisticUpdate = useCallback(
    async (optimisticData: T, apiCall: () => Promise<T | void>) => {
      const previousData = data;
      
      // Immediately update UI
      setData(optimisticData);
      setIsUpdating(true);
      setError(null);

      try {
        // Make actual API call
        const result = await apiCall();
        
        // If API returns data, use it; otherwise keep optimistic
        if (result !== undefined) {
          setData(result);
        }
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(err as Error);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [data]
  );

  const reset = useCallback((newData: T) => {
    setData(newData);
    setError(null);
  }, []);

  return { data, optimisticUpdate, isUpdating, error, reset };
}

/**
 * Hook for optimistic list operations
 */
export function useOptimisticList<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const addItem = useCallback(
    async (item: T, apiCall: () => Promise<T>) => {
      // Add immediately
      setItems(prev => [item, ...prev]);
      setPendingIds(prev => new Set(prev).add(item.id));

      try {
        const result = await apiCall();
        // Replace temp item with real one
        setItems(prev => prev.map(i => i.id === item.id ? result : i));
      } catch (err) {
        // Remove on error
        setItems(prev => prev.filter(i => i.id !== item.id));
        throw err;
      } finally {
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    []
  );

  const removeItem = useCallback(
    async (id: string, apiCall: () => Promise<void>) => {
      const item = items.find(i => i.id === id);
      if (!item) return;

      // Remove immediately
      setItems(prev => prev.filter(i => i.id !== id));
      setPendingIds(prev => new Set(prev).add(id));

      try {
        await apiCall();
      } catch (err) {
        // Restore on error
        setItems(prev => [...prev, item]);
        throw err;
      } finally {
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<T>, apiCall: () => Promise<T>) => {
      const previousItem = items.find(i => i.id === id);
      if (!previousItem) return;

      // Update immediately
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      setPendingIds(prev => new Set(prev).add(id));

      try {
        const result = await apiCall();
        setItems(prev => prev.map(i => i.id === id ? result : i));
      } catch (err) {
        // Restore on error
        setItems(prev => prev.map(i => i.id === id ? previousItem : i));
        throw err;
      } finally {
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items]
  );

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    isPending: (id: string) => pendingIds.has(id),
  };
}
