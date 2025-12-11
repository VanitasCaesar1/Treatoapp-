# Template (Mobile App) Improvement Suggestions

## 1. Security Improvements

### Token Storage Security
```typescript
// lib/auth/secure-storage.ts

/*
 * Store tokens securely on mobile.
 * 
 * Capacitor Preferences is fine for non-sensitive data,
 * but tokens should use the platform's secure storage.
 * iOS has Keychain, Android has EncryptedSharedPreferences.
 * Use them.
 */
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export async function secureStore(key: string, value: string): Promise<void> {
  await SecureStoragePlugin.set({ key, value });
}

export async function secureGet(key: string): Promise<string | null> {
  try {
    const { value } = await SecureStoragePlugin.get({ key });
    return value;
  } catch {
    return null;
  }
}

export async function secureRemove(key: string): Promise<void> {
  try {
    await SecureStoragePlugin.remove({ key });
  } catch {
    /* Key might not exist, that's fine */
  }
}
```

### API Request Signing
```typescript
// lib/auth/request-signing.ts

/*
 * Sign API requests to prevent tampering.
 * 
 * Without this, anyone can intercept and modify requests.
 * HTTPS helps, but defense in depth is not paranoia.
 */
export function signRequest(
  method: string,
  path: string,
  body: string | null,
  timestamp: number,
  secret: string
): string {
  const message = `${method}:${path}:${body || ''}:${timestamp}`;
  /* Use SubtleCrypto for HMAC-SHA256 */
  return hmacSha256(message, secret);
}

export function createSignedHeaders(
  method: string,
  path: string,
  body: string | null,
  accessToken: string
): HeadersInit {
  const timestamp = Date.now();
  const signature = signRequest(method, path, body, timestamp, accessToken);
  
  return {
    'Authorization': `Bearer ${accessToken}`,
    'X-Timestamp': timestamp.toString(),
    'X-Signature': signature,
    'Content-Type': 'application/json',
  };
}
```

### Input Sanitization
```typescript
// lib/utils/sanitize.ts

/*
 * Sanitize user input before displaying.
 * 
 * XSS is still a thing. React helps, but dangerouslySetInnerHTML
 * exists and people use it. Don't trust user input. Ever.
 */
import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') /* Remove angle brackets */
    .trim()
    .slice(0, 10000); /* Reasonable length limit */
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
}
```

## 2. Performance Improvements

### Image Optimization
```typescript
// lib/utils/image-optimization.ts

/*
 * Optimize images before upload.
 * 
 * Users will upload 10MB photos from their phone.
 * Your server doesn't need that. Your bandwidth bill
 * definitely doesn't need that.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      /* Calculate new dimensions maintaining aspect ratio */
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

### Request Deduplication
```typescript
// lib/utils/request-dedup.ts

/*
 * Deduplicate concurrent identical requests.
 * 
 * When React re-renders 5 times and each render
 * triggers the same API call, you don't need 5 requests.
 * You need 1 request and 5 subscribers.
 */
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  /* Check if request is already in flight */
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }
  
  /* Start new request */
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}
```

### Lazy Loading Components
```typescript
// components/lazy-components.ts

/*
 * Lazy load heavy components.
 * 
 * Loading the entire app upfront is wasteful.
 * Users might never visit half your pages.
 * Load what they need, when they need it.
 */
import dynamic from 'next/dynamic';

/* Heavy components that aren't needed immediately */
export const PrescriptionPDF = dynamic(
  () => import('@/components/prescription/pdf-viewer'),
  { 
    loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded" />,
    ssr: false /* PDF rendering doesn't work server-side anyway */
  }
);

export const VideoCall = dynamic(
  () => import('@/components/video/video-call'),
  { 
    loading: () => <div>Loading video...</div>,
    ssr: false 
  }
);

export const Charts = dynamic(
  () => import('@/components/analytics/charts'),
  { loading: () => <div>Loading charts...</div> }
);
```

### Optimistic Updates Pattern
```typescript
// lib/hooks/use-mutation.ts

/*
 * Optimistic updates that actually work.
 * 
 * Users shouldn't wait for the server to confirm
 * that their button click worked. Update the UI
 * immediately, rollback if it fails.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    queryKey: string[];
    optimisticUpdate: (old: TData | undefined, variables: TVariables) => TData;
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      /* Cancel outgoing refetches */
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      
      /* Snapshot current value */
      const previous = queryClient.getQueryData<TData>(options.queryKey);
      
      /* Optimistically update */
      queryClient.setQueryData<TData>(
        options.queryKey,
        (old) => options.optimisticUpdate(old, variables)
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      /* Rollback on error */
      if (context?.previous) {
        queryClient.setQueryData(options.queryKey, context.previous);
      }
    },
    onSettled: () => {
      /* Refetch to ensure consistency */
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
}
```

## 3. UX Improvements

### Skeleton Loading
```typescript
// components/ui/skeleton-list.tsx

/*
 * Skeleton screens that match your actual content.
 * 
 * A generic gray box tells users nothing.
 * A skeleton that looks like the actual content
 * sets expectations and feels faster.
 */
export function AppointmentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              {/* Name */}
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              {/* Specialty */}
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            {/* Time */}
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Error Boundaries with Recovery
```typescript
// components/error-boundary.tsx

/*
 * Error boundaries that help users recover.
 * 
 * "Something went wrong" is useless.
 * Give users a way to retry, report, or navigate away.
 */
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    /* Log to your error tracking service */
    console.error('Error boundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-xl font-semibold mb-2">Something broke</h2>
          <p className="text-gray-500 mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button onClick={this.handleRetry}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Form Validation UX
```typescript
// lib/hooks/use-form-validation.ts

/*
 * Form validation that doesn't annoy users.
 * 
 * Don't show errors before they've finished typing.
 * Don't clear their input on error.
 * Do show success states.
 */
import { useState, useCallback } from 'react';

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  valid: boolean;
}

export function useFormField(
  initialValue: string,
  validate: (value: string) => string | null
) {
  const [state, setState] = useState<FieldState>({
    value: initialValue,
    error: null,
    touched: false,
    valid: false,
  });

  const onChange = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      value,
      /* Only validate if already touched */
      error: prev.touched ? validate(value) : null,
      valid: prev.touched ? validate(value) === null : false,
    }));
  }, [validate]);

  const onBlur = useCallback(() => {
    setState(prev => ({
      ...prev,
      touched: true,
      error: validate(prev.value),
      valid: validate(prev.value) === null,
    }));
  }, [validate]);

  return { ...state, onChange, onBlur };
}
```

## 4. Accessibility

### Focus Management
```typescript
// lib/hooks/use-focus-trap.ts

/*
 * Trap focus in modals and dialogs.
 * 
 * Keyboard users shouldn't be able to tab
 * outside a modal. It's confusing and breaks
 * the mental model of "this is a dialog".
 */
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    /* Focus first element on open */
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

### Screen Reader Announcements
```typescript
// components/ui/live-region.tsx

/*
 * Announce dynamic content to screen readers.
 * 
 * When content changes without a page load,
 * screen reader users have no idea unless
 * you tell them.
 */
'use client';

import { useEffect, useState } from 'react';

let announceTimeout: NodeJS.Timeout;

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  /* Clear previous announcement */
  clearTimeout(announceTimeout);
  
  const region = document.getElementById(`live-region-${priority}`);
  if (region) {
    region.textContent = '';
    announceTimeout = setTimeout(() => {
      region.textContent = message;
    }, 100);
  }
}

export function LiveRegions() {
  return (
    <>
      <div
        id="live-region-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
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
```
