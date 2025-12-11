'use client';

import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number; // Estimated height for each item
  overscan?: number; // Number of items to render outside viewport
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: ReactNode;
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  className?: string;
}

/**
 * Virtualized list for rendering large lists efficiently
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 0.8,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  className = '',
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = items.slice(startIndex, endIndex);

  // Handle scroll
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);

    // Check if near end
    if (onEndReached) {
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold]);

  // Setup scroll listener and measure container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerHeight(container.clientHeight);
    container.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver((entries) => {
      setContainerHeight(entries[0].contentRect.height);
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [handleScroll]);

  if (items.length === 0 && ListEmptyComponent) {
    return <>{ListEmptyComponent}</>;
  }

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`}>
      {ListHeaderComponent}
      
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={keyExtractor(item, actualIndex)}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>

      {ListFooterComponent}
    </div>
  );
}

/**
 * Simpler infinite scroll list (not virtualized but with lazy loading)
 */
interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: ReactNode;
  LoadingComponent?: ReactNode;
  className?: string;
}

export function InfiniteList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  isLoading,
  keyExtractor,
  ListEmptyComponent,
  LoadingComponent,
  className = '',
}: InfiniteListProps<T>) {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  if (items.length === 0 && !isLoading && ListEmptyComponent) {
    return <>{ListEmptyComponent}</>;
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4">
          {isLoading && LoadingComponent}
        </div>
      )}
    </div>
  );
}

/**
 * Lazy loaded image with blur placeholder
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholderColor = '#f3f4f6',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (inView) {
      setIsInView(true);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: placeholderColor }}
    >
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
      
      {/* Skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
    </div>
  );
}
