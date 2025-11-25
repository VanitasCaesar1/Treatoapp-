import { useEffect, useState, useCallback } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

interface NetworkStatus {
    connected: boolean;
    connectionType: string;
    isWiFi: boolean;
    isCellular: boolean;
}

/**
 * Monitor network status during video call
 * Detect WiFi ↔ Cellular transitions for quality adjustment
 */
export function useNetworkStatus() {
    const [status, setStatus] = useState<NetworkStatus>({
        connected: true,
        connectionType: 'unknown',
        isWiFi: false,
        isCellular: false
    });

    const [hasWarned, setHasWarned] = useState(false);

    const checkStatus = useCallback(async () => {
        try {
            const networkStatus: ConnectionStatus = await Network.getStatus();

            const newStatus: NetworkStatus = {
                connected: networkStatus.connected,
                connectionType: networkStatus.connectionType,
                isWiFi: networkStatus.connectionType === 'wifi',
                isCellular: networkStatus.connectionType === 'cellular'
            };

            setStatus(newStatus);

            // Warn when switching to cellular (might affect quality)
            if (newStatus.isCellular && !hasWarned) {
                console.warn('Switched to cellular data - video quality may be affected');
                setHasWarned(true);
            }

            // Reset warning when back on WiFi
            if (newStatus.isWiFi && hasWarned) {
                setHasWarned(false);
            }

            return newStatus;
        } catch (error) {
            console.error('Failed to check network status:', error);
            return status;
        }
    }, [hasWarned, status]);

    useEffect(() => {
        // Initial check
        checkStatus();

        let listenerHandle: any = null;

        // Listen for network changes - addListener returns a Promise
        Network.addListener('networkStatusChange', (newStatus) => {
            setStatus({
                connected: newStatus.connected,
                connectionType: newStatus.connectionType,
                isWiFi: newStatus.connectionType === 'wifi',
                isCellular: newStatus.connectionType === 'cellular'
            });

            // Log network transitions
            console.log('Network changed:', newStatus.connectionType);
        }).then((handle) => {
            listenerHandle = handle;
        });

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, [checkStatus]);

    return {
        ...status,
        refresh: checkStatus,
        hasWarned
    };
}
