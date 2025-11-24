'use client';

import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { isNativePlatform } from '@/lib/utils/mobile';

/**
 * Use local storage with Capacitor Preferences on native, localStorage on web
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        if (isNativePlatform()) {
          const { value } = await Preferences.get({ key });
          if (value !== null) {
            setStoredValue(JSON.parse(value));
          }
        } else {
          const item = window.localStorage.getItem(key);
          if (item) {
            setStoredValue(JSON.parse(item));
          }
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (isNativePlatform()) {
        await Preferences.set({
          key,
          value: JSON.stringify(valueToStore),
        });
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  const removeValue = async () => {
    try {
      setStoredValue(initialValue);
      
      if (isNativePlatform()) {
        await Preferences.remove({ key });
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  };

  return [storedValue, setValue, removeValue, isLoading] as const;
}
