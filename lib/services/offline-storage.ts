import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

/**
 * Offline storage service for caching data locally
 */

const CACHE_PREFIX = 'cache_';
const CACHE_EXPIRY_PREFIX = 'cache_expiry_';
const PENDING_ACTIONS_KEY = 'pending_offline_actions';

interface CacheOptions {
  expiryMinutes?: number;
}

interface PendingAction {
  id: string;
  type: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  timestamp: number;
}

/**
 * Cache data locally
 */
export async function cacheData<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { expiryMinutes = 60 } = options;
  const cacheKey = CACHE_PREFIX + key;
  const expiryKey = CACHE_EXPIRY_PREFIX + key;
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;

  await Promise.all([
    Preferences.set({ key: cacheKey, value: JSON.stringify(data) }),
    Preferences.set({ key: expiryKey, value: expiryTime.toString() }),
  ]);
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  const cacheKey = CACHE_PREFIX + key;
  const expiryKey = CACHE_EXPIRY_PREFIX + key;

  const [{ value: data }, { value: expiry }] = await Promise.all([
    Preferences.get({ key: cacheKey }),
    Preferences.get({ key: expiryKey }),
  ]);

  if (!data) return null;

  // Check expiry
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    await clearCache(key);
    return null;
  }

  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Clear specific cache
 */
export async function clearCache(key: string): Promise<void> {
  await Promise.all([
    Preferences.remove({ key: CACHE_PREFIX + key }),
    Preferences.remove({ key: CACHE_EXPIRY_PREFIX + key }),
  ]);
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  const { keys } = await Preferences.keys();
  const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX) || k.startsWith(CACHE_EXPIRY_PREFIX));
  await Promise.all(cacheKeys.map(key => Preferences.remove({ key })));
}

/**
 * Queue action for offline sync
 */
export async function queueOfflineAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<void> {
  const pending = await getPendingActions();
  const newAction: PendingAction = {
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  pending.push(newAction);
  await Preferences.set({ key: PENDING_ACTIONS_KEY, value: JSON.stringify(pending) });
}

/**
 * Get pending offline actions
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  const { value } = await Preferences.get({ key: PENDING_ACTIONS_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

/**
 * Remove pending action after sync
 */
export async function removePendingAction(id: string): Promise<void> {
  const pending = await getPendingActions();
  const filtered = pending.filter(a => a.id !== id);
  await Preferences.set({ key: PENDING_ACTIONS_KEY, value: JSON.stringify(filtered) });
}

/**
 * Sync pending actions when online
 */
export async function syncPendingActions(
  fetchFn: (endpoint: string, options: RequestInit) => Promise<Response>
): Promise<{ success: number; failed: number }> {
  const pending = await getPendingActions();
  let success = 0;
  let failed = 0;

  for (const action of pending) {
    try {
      const response = await fetchFn(action.endpoint, {
        method: action.type,
        headers: { 'Content-Type': 'application/json' },
        body: action.data ? JSON.stringify(action.data) : undefined,
      });

      if (response.ok) {
        await removePendingAction(action.id);
        success++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Check network status
 */
export async function isOnline(): Promise<boolean> {
  const status = await Network.getStatus();
  return status.connected;
}

/**
 * Listen for network changes
 */
export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handler = Network.addListener('networkStatusChange', (status) => {
    callback(status.connected);
  });

  return () => {
    handler.then(h => h.remove());
  };
}

/**
 * Fetch with offline fallback
 */
export async function fetchWithOfflineFallback<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<{ data: T; fromCache: boolean }> {
  const online = await isOnline();

  if (online) {
    try {
      const data = await fetcher();
      await cacheData(key, data, options);
      return { data, fromCache: false };
    } catch (error) {
      // Fallback to cache on error
      const cached = await getCachedData<T>(key);
      if (cached) {
        return { data: cached, fromCache: true };
      }
      throw error;
    }
  } else {
    // Offline - use cache
    const cached = await getCachedData<T>(key);
    if (cached) {
      return { data: cached, fromCache: true };
    }
    throw new Error('No cached data available offline');
  }
}
