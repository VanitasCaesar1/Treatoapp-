import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Prefetch data on hover/focus for instant navigation
 * 
 * Usage:
 * const prefetch = usePrefetch();
 * 
 * <Link 
 *   href={`/doctor/${id}`}
 *   onMouseEnter={() => prefetch.doctor(id)}
 *   onFocus={() => prefetch.doctor(id)}
 * >
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetchOnce = useCallback(
    async (key: string, fetcher: () => Promise<any>) => {
      if (prefetchedRef.current.has(key)) return;
      prefetchedRef.current.add(key);
      
      try {
        await queryClient.prefetchQuery({
          queryKey: [key],
          queryFn: fetcher,
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      } catch (err) {
        // Silently fail prefetch
        prefetchedRef.current.delete(key);
      }
    },
    [queryClient]
  );

  return {
    doctor: (id: string) => prefetchOnce(
      `doctor-${id}`,
      () => fetch(`/api/doctors/${id}`).then(r => r.json())
    ),
    
    appointment: (id: string) => prefetchOnce(
      `appointment-${id}`,
      () => fetch(`/api/appointments/${id}`).then(r => r.json())
    ),
    
    prescription: (id: string) => prefetchOnce(
      `prescription-${id}`,
      () => fetch(`/api/appointments/${id}/prescription`).then(r => r.json())
    ),
    
    profile: () => prefetchOnce(
      'user-profile',
      () => fetch('/api/user/profile').then(r => r.json())
    ),
  };
}

/**
 * Prefetch on viewport intersection (for lists)
 */
export function usePrefetchOnVisible(
  fetcher: () => Promise<any>,
  queryKey: string
) {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    queryClient.prefetchQuery({
      queryKey: [queryKey],
      queryFn: fetcher,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, queryKey, fetcher]);

  return prefetch;
}

/**
 * Preload images for instant display
 */
export function useImagePreloader() {
  const preloadedRef = useRef<Set<string>>(new Set());

  const preload = useCallback((urls: string[]) => {
    urls.forEach(url => {
      if (preloadedRef.current.has(url)) return;
      preloadedRef.current.add(url);

      const img = new Image();
      img.src = url;
    });
  }, []);

  return preload;
}

/**
 * Preload next page data
 */
export function usePreloadNextPage(
  currentPage: number,
  hasMore: boolean,
  fetcher: (page: number) => Promise<any>,
  queryKeyPrefix: string
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hasMore) return;

    const nextPage = currentPage + 1;
    queryClient.prefetchQuery({
      queryKey: [queryKeyPrefix, nextPage],
      queryFn: () => fetcher(nextPage),
      staleTime: 2 * 60 * 1000,
    });
  }, [currentPage, hasMore, fetcher, queryKeyPrefix, queryClient]);
}
