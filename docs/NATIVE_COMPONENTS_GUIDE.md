# Native Components Guide

This guide shows how to use the native-feeling components to make the app feel fast and responsive.

## Quick Start

### 1. Haptic Feedback

```tsx
import { haptic, useHapticButton } from '@/lib/hooks';

// Simple usage
const handleTap = async () => {
  await haptic.light();
  // do something
};

// With hook
const handlePress = useHapticButton('medium');
<button onClick={() => handlePress(() => doSomething())}>Tap me</button>
```

### 2. Pull to Refresh

```tsx
import { NativePullRefresh } from '@/components/mobile';

function MyPage() {
  const handleRefresh = async () => {
    await fetchData();
  };

  return (
    <NativePullRefresh onRefresh={handleRefresh}>
      <div>Your content here</div>
    </NativePullRefresh>
  );
}
```

### 3. Swipeable List Items

```tsx
import { SwipeableItem, SwipeActions } from '@/components/mobile';

function AppointmentCard({ appointment, onDelete, onEdit }) {
  return (
    <SwipeableItem
      rightActions={[
        SwipeActions.delete(onDelete),
        SwipeActions.edit(onEdit),
      ]}
    >
      <div className="p-4">
        <h3>{appointment.doctorName}</h3>
        <p>{appointment.date}</p>
      </div>
    </SwipeableItem>
  );
}
```

### 4. iOS-style Large Title Header

```tsx
import { LargeTitleHeader } from '@/components/mobile';

function AppointmentsPage() {
  return (
    <LargeTitleHeader
      title="Appointments"
      subtitle="Upcoming visits"
      showBack
      rightAction={<button>+</button>}
    >
      <div>Your content scrolls here</div>
    </LargeTitleHeader>
  );
}
```

### 5. Bottom Sheet

```tsx
import { NativeBottomSheet, ActionSheet } from '@/components/mobile';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Sheet</button>
      
      <NativeBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Options"
        snapPoints={[50, 90]}
      >
        <div>Sheet content</div>
      </NativeBottomSheet>
    </>
  );
}

// Or use ActionSheet for quick actions
<ActionSheet
  isOpen={showActions}
  onClose={() => setShowActions(false)}
  title="Choose an action"
  actions={[
    { label: 'Edit', onPress: handleEdit },
    { label: 'Delete', destructive: true, onPress: handleDelete },
  ]}
/>
```

### 6. Toast Notifications

```tsx
import { ToastProvider, useToast } from '@/components/mobile';

// Wrap your app
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// Use in components
function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Saved successfully!');
    } catch (err) {
      toast.error('Failed to save');
    }
  };
}
```

### 7. Optimistic Updates

```tsx
import { useOptimistic } from '@/lib/hooks';

function LikeButton({ post }) {
  const { data, optimisticUpdate } = useOptimistic(post);

  const handleLike = () => {
    optimisticUpdate(
      { ...data, liked: true, likes: data.likes + 1 }, // Instant UI update
      async () => await api.likePost(post.id) // Actual API call
    );
  };

  return (
    <button onClick={handleLike}>
      {data.liked ? '❤️' : '🤍'} {data.likes}
    </button>
  );
}
```

### 8. Prefetching

```tsx
import { usePrefetch } from '@/lib/hooks';

function DoctorCard({ doctor }) {
  const prefetch = usePrefetch();

  return (
    <Link
      href={`/doctor/${doctor.id}`}
      onMouseEnter={() => prefetch.doctor(doctor.id)}
      onFocus={() => prefetch.doctor(doctor.id)}
    >
      <div>{doctor.name}</div>
    </Link>
  );
}
```

### 9. Offline Support

```tsx
import { fetchWithOfflineFallback, queueOfflineAction } from '@/lib/services/offline-storage';

// Fetch with offline fallback
const { data, fromCache } = await fetchWithOfflineFallback(
  'appointments',
  () => fetch('/api/appointments').then(r => r.json()),
  { expiryMinutes: 30 }
);

if (fromCache) {
  showToast('Showing cached data');
}

// Queue action for offline sync
await queueOfflineAction({
  type: 'POST',
  endpoint: '/api/appointments',
  data: newAppointment,
});
```

### 10. App Lifecycle

```tsx
import { useRefreshOnForeground, useExitConfirmation } from '@/lib/hooks';

function MyPage() {
  // Refresh data when app comes to foreground
  useRefreshOnForeground(async () => {
    await refetchData();
  });

  // Require double back press to exit
  useExitConfirmation('Press back again to exit');
}
```

## Best Practices

1. **Always add haptic feedback** to buttons and interactive elements
2. **Use optimistic updates** for actions like likes, saves, follows
3. **Prefetch data** on hover/focus for instant navigation
4. **Cache important data** for offline access
5. **Use skeleton loaders** instead of spinners
6. **Add pull-to-refresh** on list pages
7. **Use swipeable items** for list actions instead of buttons
8. **Use bottom sheets** instead of modals on mobile
