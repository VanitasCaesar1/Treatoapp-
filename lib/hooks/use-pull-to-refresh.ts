import { useEffect, useCallback, useRef } from 'react';

interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    disabled?: boolean;
}

/**
 * Pull-to-refresh hook for Capacitor apps
 * Provides native iOS/Android style pull-to-refresh functionality
 */
export const usePullToRefresh = ({
    onRefresh,
    threshold = 80,
    disabled = false,
}: PullToRefreshOptions) => {
    const startY = useRef(0);
    const currentY = useRef(0);
    const pullDistance = useRef(0);
    const isRefreshing = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (disabled || isRefreshing.current) return;

        const container = containerRef.current;
        if (!container) return;

        // Only trigger if scrolled to top
        if (container.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
        }
    }, [disabled]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (disabled || isRefreshing.current || startY.current === 0) return;

        const container = containerRef.current;
        if (!container || container.scrollTop > 0) return;

        currentY.current = e.touches[0].clientY;
        pullDistance.current = currentY.current - startY.current;

        if (pullDistance.current > 0) {
            // Prevent default scroll behavior when pulling down
            e.preventDefault();

            // Add visual feedback (optional - can be styled in component)
            const dampedDistance = Math.min(pullDistance.current * 0.5, threshold * 1.5);
            container.style.transform = `translateY(${dampedDistance}px)`;
            container.style.transition = 'none';
        }
    }, [disabled, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (disabled || isRefreshing.current) return;

        const container = containerRef.current;
        if (!container) return;

        if (pullDistance.current >= threshold) {
            isRefreshing.current = true;

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                isRefreshing.current = false;
            }
        }

        // Reset
        container.style.transform = '';
        container.style.transition = 'transform 0.3s ease';
        startY.current = 0;
        currentY.current = 0;
        pullDistance.current = 0;
    }, [disabled, threshold, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        isRefreshing: isRefreshing.current,
    };
};
