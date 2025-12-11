/*
 * Focus Trap Hook
 *
 * Trap focus in modals and dialogs. Keyboard users shouldn't be
 * able to tab outside a modal. It's confusing and breaks the
 * mental model of "this is a dialog".
 *
 * Usage:
 *   const containerRef = useFocusTrap(isOpen);
 *   return <div ref={containerRef}>...</div>
 */
'use client';

import { useEffect, useRef, useCallback } from 'react';

/*
 * Focusable element selector.
 * These are elements that can receive keyboard focus.
 */
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  /* Whether the trap is active */
  enabled?: boolean;
  /* Focus first element on activation */
  autoFocus?: boolean;
  /* Return focus to trigger element on deactivation */
  returnFocus?: boolean;
  /* Element to focus initially (overrides autoFocus) */
  initialFocus?: React.RefObject<HTMLElement>;
}

/*
 * useFocusTrap - Trap keyboard focus within a container
 *
 * When active, Tab and Shift+Tab cycle through focusable elements
 * within the container, never leaving it.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const {
    enabled = true,
    autoFocus = true,
    returnFocus = true,
    initialFocus,
  } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /*
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
    );

    return Array.from(elements).filter((el) => {
      /*
       * Filter out elements that are hidden or have display: none.
       * These shouldn't receive focus.
       */
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !el.hasAttribute('hidden')
      );
    });
  }, []);

  /*
   * Handle keydown events for Tab navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      /*
       * Shift+Tab on first element -> go to last
       * Tab on last element -> go to first
       */
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [enabled, getFocusableElements]
  );

  /*
   * Handle focus events to keep focus within container
   */
  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      if (!enabled || !containerRef.current) return;

      const target = event.target as HTMLElement;

      /*
       * If focus moved outside the container, bring it back
       */
      if (!containerRef.current.contains(target)) {
        event.preventDefault();
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    },
    [enabled, getFocusableElements]
  );

  /*
   * Activate trap - save previous focus and focus first element
   */
  useEffect(() => {
    if (!enabled) return;

    /* Save currently focused element */
    previousActiveElement.current = document.activeElement as HTMLElement;

    /* Focus initial element */
    if (autoFocus) {
      /*
       * Use requestAnimationFrame to ensure the container is rendered
       * before we try to focus elements inside it.
       */
      requestAnimationFrame(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      });
    }

    /* Add event listeners */
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      /* Return focus to previous element */
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, autoFocus, returnFocus, initialFocus, handleKeyDown, handleFocusIn, getFocusableElements]);

  return containerRef;
}

/*
 * FocusTrap - Component wrapper for focus trap
 *
 * Usage:
 *   <FocusTrap enabled={isOpen}>
 *     <div>Modal content</div>
 *   </FocusTrap>
 */
interface FocusTrapProps extends UseFocusTrapOptions {
  children: React.ReactNode;
  className?: string;
}

export function FocusTrap({
  children,
  className,
  ...options
}: FocusTrapProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(options);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/*
 * useFocusOnMount - Focus an element when component mounts
 *
 * Usage:
 *   const inputRef = useFocusOnMount<HTMLInputElement>();
 *   return <input ref={inputRef} />
 */
export function useFocusOnMount<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      /*
       * Small delay to ensure element is fully rendered.
       * This helps with animations and transitions.
       */
      const timer = setTimeout(() => {
        ref.current?.focus();
      }, 10);

      return () => clearTimeout(timer);
    }
  }, []);

  return ref;
}

/*
 * useRestoreFocus - Restore focus when component unmounts
 *
 * Usage:
 *   useRestoreFocus();
 *   // Focus will return to previous element when component unmounts
 */
export function useRestoreFocus() {
  const previousElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousElement.current = document.activeElement as HTMLElement;

    return () => {
      if (previousElement.current && document.body.contains(previousElement.current)) {
        previousElement.current.focus();
      }
    };
  }, []);
}
