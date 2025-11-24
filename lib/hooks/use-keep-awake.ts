import { useEffect } from 'react';
import { KeepAwake } from '@capacitor-community/keep-awake';

/**
 * Prevent screen from sleeping during video call
 * Automatically allows sleep when hook unmounts or isActive becomes false
 */
export function useKeepAwake(isActive: boolean) {
    useEffect(() => {
        if (isActive) {
            const activateKeepAwake = async () => {
                try {
                    await KeepAwake.keepAwake();
                    console.log('Screen will stay awake during call');
                } catch (error) {
                    console.error('Failed to keep screen awake:', error);
                }
            };

            activateKeepAwake();

            return () => {
                const allowSleep = async () => {
                    try {
                        await KeepAwake.allowSleep();
                        console.log('Screen can sleep now');
                    } catch (error) {
                        console.error('Failed to allow sleep:', error);
                    }
                };

                allowSleep();
            };
        }
    }, [isActive]);
}
