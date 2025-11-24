'use client';

import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // Get initial status
    Network.getStatus().then((status) => {
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    // Listen for changes
    const listener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
  };
}
