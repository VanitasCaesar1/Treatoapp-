/*
 * Request Deduplication
 *
 * When React re-renders 5 times and each render triggers the same
 * API call, you don't need 5 requests. You need 1 request and 5
 * subscribers waiting for the result.
 *
 * This module provides request deduplication at the fetch level.
 * Concurrent identical requests are merged into a single network call.
 *
 * Usage:
 *   const data = await deduplicatedFetch('/api/users/123', fetchUser);
 *   // Multiple calls with same key share the same request
 */

/*
 * Map of pending requests.
 * Key is the dedup key, value is the promise.
 */
const pendingRequests = new Map<string, Promise<any>>();

/*
 * deduplicatedFetch - Fetch with automatic deduplication
 *
 * If a request with the same key is already in flight, returns
 * the existing promise instead of making a new request.
 *
 * @param key - Unique key for this request (usually the URL)
 * @param fetcher - Function that performs the actual fetch
 * @returns Promise that resolves with the fetch result
 *
 * Example:
 *   const user = await deduplicatedFetch(
 *     `/api/users/${id}`,
 *     () => fetch(`/api/users/${id}`).then(r => r.json())
 *   );
 */
export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  /*
   * Check if request is already in flight.
   * If so, return the existing promise - all callers will
   * get the same result when it resolves.
   */
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  /*
   * Start new request and store the promise.
   * Use finally() to clean up regardless of success/failure.
   */
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/*
 * createDedupKey - Create a consistent key for deduplication
 *
 * Handles URL normalization and query parameter ordering.
 */
export function createDedupKey(
  url: string,
  options?: { method?: string; body?: string }
): string {
  const method = options?.method?.toUpperCase() || 'GET';
  const body = options?.body || '';

  /*
   * For GET requests, the URL is enough.
   * For mutations, include method and body hash.
   */
  if (method === 'GET') {
    return normalizeUrl(url);
  }

  return `${method}:${normalizeUrl(url)}:${hashString(body)}`;
}

/*
 * normalizeUrl - Normalize URL for consistent keys
 *
 * Sorts query parameters so ?a=1&b=2 equals ?b=2&a=1
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);

    /* Sort query parameters */
    const params = new URLSearchParams(parsed.search);
    const sortedParams = new URLSearchParams(
      [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    );

    parsed.search = sortedParams.toString();
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

/*
 * hashString - Simple string hash for body comparison
 *
 * Not cryptographic - just for dedup key generation.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/*
 * dedupFetch - Drop-in replacement for fetch with deduplication
 *
 * Use this instead of fetch() for automatic deduplication.
 * Only deduplicates GET requests by default.
 *
 * Example:
 *   const response = await dedupFetch('/api/users');
 *   const data = await response.json();
 */
export async function dedupFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method?.toUpperCase() || 'GET';

  /*
   * Only deduplicate GET requests.
   * Mutations should always go through.
   */
  if (method !== 'GET') {
    return fetch(input, init);
  }

  const key = createDedupKey(url);

  return deduplicatedFetch(key, () => fetch(input, init));
}

/*
 * RequestBatcher - Batch multiple requests into one
 *
 * For cases where you're fetching many items by ID,
 * batch them into a single request.
 *
 * Example:
 *   const batcher = new RequestBatcher<User>(
 *     (ids) => fetch(`/api/users?ids=${ids.join(',')}`).then(r => r.json())
 *   );
 *
 *   // These will be batched into a single request
 *   const user1 = await batcher.load('id1');
 *   const user2 = await batcher.load('id2');
 */
export class RequestBatcher<T> {
  private queue: Map<string, { resolve: (value: T) => void; reject: (error: Error) => void }[]> =
    new Map();
  private timeout: NodeJS.Timeout | null = null;
  private batchFn: (ids: string[]) => Promise<Map<string, T>>;
  private delayMs: number;

  constructor(
    batchFn: (ids: string[]) => Promise<Map<string, T>>,
    delayMs: number = 10
  ) {
    this.batchFn = batchFn;
    this.delayMs = delayMs;
  }

  /*
   * load - Request an item by ID
   *
   * The actual request is delayed to allow batching.
   */
  load(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const callbacks = this.queue.get(id) || [];
      callbacks.push({ resolve, reject });
      this.queue.set(id, callbacks);

      /* Schedule batch execution */
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.executeBatch(), this.delayMs);
      }
    });
  }

  /*
   * executeBatch - Execute the batched request
   */
  private async executeBatch(): Promise<void> {
    this.timeout = null;

    const ids = Array.from(this.queue.keys());
    const callbacks = new Map(this.queue);
    this.queue.clear();

    try {
      const results = await this.batchFn(ids);

      for (const [id, cbs] of callbacks) {
        const result = results.get(id);
        if (result !== undefined) {
          cbs.forEach((cb) => cb.resolve(result));
        } else {
          cbs.forEach((cb) => cb.reject(new Error(`Item ${id} not found`)));
        }
      }
    } catch (error) {
      for (const cbs of callbacks.values()) {
        cbs.forEach((cb) => cb.reject(error as Error));
      }
    }
  }
}

/*
 * clearPendingRequests - Clear all pending requests
 *
 * Useful for testing or when navigating away.
 */
export function clearPendingRequests(): void {
  pendingRequests.clear();
}

/*
 * getPendingRequestCount - Get count of pending requests
 *
 * Useful for debugging and testing.
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size;
}
