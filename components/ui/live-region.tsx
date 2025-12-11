/*
 * Live Region Components for Screen Readers
 *
 * When content changes without a page load, screen reader users
 * have no idea unless you tell them. ARIA live regions announce
 * dynamic content changes.
 *
 * Two types:
 * - polite: Waits for user to finish current task before announcing
 * - assertive: Interrupts immediately (use sparingly)
 *
 * Usage:
 *   // In your layout
 *   <LiveRegions />
 *
 *   // Anywhere in your app
 *   import { announce } from '@/components/ui/live-region';
 *   announce('Item added to cart');
 *   announce('Error: Invalid email', 'assertive');
 */
'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';

/*
 * Announcement queue to prevent overlapping announcements
 */
interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
}

let announceTimeout: NodeJS.Timeout | null = null;
let politeRegion: HTMLElement | null = null;
let assertiveRegion: HTMLElement | null = null;

/*
 * announce - Announce a message to screen readers
 *
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 *
 * Example:
 *   announce('Form submitted successfully');
 *   announce('Error: Please fix the highlighted fields', 'assertive');
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof window === 'undefined') return;

  const region = priority === 'assertive' ? assertiveRegion : politeRegion;
  if (!region) {
    console.warn('LiveRegions component not mounted. Add <LiveRegions /> to your layout.');
    return;
  }

  /*
   * Clear previous announcement first.
   * This ensures the new message is announced even if it's the same.
   */
  if (announceTimeout) {
    clearTimeout(announceTimeout);
  }

  region.textContent = '';

  /*
   * Small delay before setting new content.
   * This gives screen readers time to notice the change.
   */
  announceTimeout = setTimeout(() => {
    region.textContent = message;
  }, 100);
}

/*
 * LiveRegions - Invisible containers for screen reader announcements
 *
 * Add this once in your root layout. It creates two hidden regions:
 * - One for polite announcements (status updates)
 * - One for assertive announcements (errors, urgent info)
 */
export function LiveRegions() {
  useEffect(() => {
    /*
     * Store references to the regions for the announce function.
     * We do this in useEffect to ensure we're on the client.
     */
    politeRegion = document.getElementById('live-region-polite');
    assertiveRegion = document.getElementById('live-region-assertive');

    return () => {
      politeRegion = null;
      assertiveRegion = null;
      if (announceTimeout) {
        clearTimeout(announceTimeout);
      }
    };
  }, []);

  return (
    <>
      {/*
       * Polite region - for status updates, success messages.
       * Screen reader waits for pause before announcing.
       */}
      <div
        id="live-region-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/*
       * Assertive region - for errors, urgent information.
       * Screen reader interrupts current speech to announce.
       * Use sparingly - it's disruptive.
       */}
      <div
        id="live-region-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

/*
 * useAnnounce - Hook for announcing messages
 *
 * Usage:
 *   const announce = useAnnounce();
 *   announce('Item deleted');
 */
export function useAnnounce() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);
}

/*
 * Announcer - Context-based announcer for complex apps
 *
 * Provides a queue-based system for managing multiple announcements.
 */
interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function AnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Announcement[]>([]);

  /*
   * Process queue - announce messages one at a time
   */
  useEffect(() => {
    if (queue.length === 0) return;

    const [current, ...rest] = queue;
    announce(current.message, current.priority);

    /*
     * Wait before processing next message.
     * This gives screen readers time to finish speaking.
     */
    const timer = setTimeout(() => {
      setQueue(rest);
    }, 1000);

    return () => clearTimeout(timer);
  }, [queue]);

  const addToQueue = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setQueue((prev) => [...prev, { id, message, priority }]);
    },
    []
  );

  const value: AnnouncerContextType = {
    announce: addToQueue,
    announcePolite: (message) => addToQueue(message, 'polite'),
    announceAssertive: (message) => addToQueue(message, 'assertive'),
  };

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <LiveRegions />
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within AnnouncerProvider');
  }
  return context;
}

/*
 * VisuallyHidden - Hide content visually but keep it accessible
 *
 * Use for content that should be read by screen readers but not
 * visible on screen.
 *
 * Usage:
 *   <button>
 *     <Icon />
 *     <VisuallyHidden>Delete item</VisuallyHidden>
 *   </button>
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/*
 * SkipLink - Skip to main content link
 *
 * Allows keyboard users to skip navigation and go directly to
 * main content. Should be the first focusable element on the page.
 *
 * Usage:
 *   // In your layout, before navigation
 *   <SkipLink href="#main-content">Skip to main content</SkipLink>
 *
 *   // On your main content
 *   <main id="main-content">...</main>
 */
export function SkipLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-md"
    >
      {children}
    </a>
  );
}
