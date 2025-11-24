# Design Document

## Overview

The UI/UX Enhancement design establishes a comprehensive mobile-first design system for the Patient App. This includes a modern color palette, typography scale, spacing system, component library enhancements, animation patterns, and interaction guidelines. The design prioritizes touch interactions, visual clarity, and delightful micro-interactions to create a polished healthcare experience.

## Design System

### Color Palette

#### Primary Colors
```css
--primary-50: #f0f9ff
--primary-100: #e0f2fe
--primary-200: #bae6fd
--primary-300: #7dd3fc
--primary-400: #38bdf8
--primary-500: #0ea5e9  /* Main brand color */
--primary-600: #0284c7
--primary-700: #0369a1
--primary-800: #075985
--primary-900: #0c4a6e
```

#### Secondary Colors (Healthcare Green)
```css
--secondary-50: #f0fdf4
--secondary-100: #dcfce7
--secondary-200: #bbf7d0
--secondary-300: #86efac
--secondary-400: #4ade80
--secondary-500: #22c55e  /* Success/Health */
--secondary-600: #16a34a
--secondary-700: #15803d
--secondary-800: #166534
--secondary-900: #14532d
```

#### Accent Colors (Medical Purple)
```css
--accent-50: #faf5ff
--accent-100: #f3e8ff
--accent-200: #e9d5ff
--accent-300: #d8b4fe
--accent-400: #c084fc
--accent-500: #a855f7  /* Accent */
--accent-600: #9333ea
--accent-700: #7e22ce
--accent-800: #6b21a8
--accent-900: #581c87
```

#### Semantic Colors
```css
/* Success */
--success: #22c55e
--success-light: #dcfce7
--success-dark: #15803d

/* Warning */
--warning: #f59e0b
--warning-light: #fef3c7
--warning-dark: #d97706

/* Error */
--error: #ef4444
--error-light: #fee2e2
--error-dark: #dc2626

/* Info */
--info: #3b82f6
--info-light: #dbeafe
--info-dark: #1d4ed8
```

#### Neutral Colors
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

--white: #ffffff
--black: #000000
```

### Typography

#### Font Family
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

#### Font Sizes (Mobile-Optimized)
```css
--text-xs: 0.75rem    /* 12px - Captions, labels */
--text-sm: 0.875rem   /* 14px - Secondary text */
--text-base: 1rem     /* 16px - Body text */
--text-lg: 1.125rem   /* 18px - Emphasized text */
--text-xl: 1.25rem    /* 20px - Small headings */
--text-2xl: 1.5rem    /* 24px - Section headings */
--text-3xl: 1.875rem  /* 30px - Page titles */
--text-4xl: 2.25rem   /* 36px - Hero text */
```

#### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

#### Line Heights
```css
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

### Spacing Scale

Based on 4px unit:
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.5rem   /* 8px - Buttons, inputs */
--radius-md: 0.75rem  /* 12px - Cards */
--radius-lg: 1rem     /* 16px - Modals */
--radius-xl: 1.5rem   /* 24px - Large cards */
--radius-full: 9999px /* Circular - Avatars, pills */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Animation Timings

```css
--duration-fast: 150ms
--duration-normal: 200ms
--duration-slow: 300ms
--duration-slower: 500ms

--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

## Component Enhancements

### Bottom Navigation

**Design:**
- Fixed at bottom of screen
- Height: 64px (80px on iPhone with notch)
- 4-5 navigation items with icons and labels
- Active state: Primary color with filled icon
- Inactive state: Gray with outline icon
- Safe area padding for devices with notch

**Structure:**
```
┌─────────────────────────────────────┐
│                                     │
│         Page Content                │
│                                     │
├─────────────────────────────────────┤
│  [Home]  [Doctors]  [Appts]  [More] │
│   🏠       👨‍⚕️        📅       ⋯    │
└─────────────────────────────────────┘
```

### Cards

**Variants:**

1. **Appointment Card**
   - Padding: 16px
   - Border radius: 12px
   - Shadow: md
   - Left accent border (4px) with status color
   - Doctor avatar (48px circular)
   - Title: text-lg, font-semibold
   - Details: text-sm, gray-600
   - Action button: Primary color

2. **Doctor Card**
   - Padding: 16px
   - Border radius: 12px
   - Shadow: sm
   - Doctor photo (64px circular)
   - Name: text-lg, font-semibold
   - Specialty: text-sm, primary color
   - Rating stars with count
   - Quick book button

3. **Medical Record Card**
   - Padding: 16px
   - Border radius: 12px
   - Background: gradient or solid
   - Icon badge (32px)
   - Date: text-xs, gray-500
   - Title: text-base, font-medium
   - Chevron right indicator

### Buttons

**Primary Button:**
```css
background: primary-500
color: white
padding: 12px 24px
border-radius: 8px
font-weight: 600
shadow: md
active:scale-95
transition: all 200ms
```

**Secondary Button:**
```css
background: gray-100
color: gray-900
padding: 12px 24px
border-radius: 8px
font-weight: 600
active:scale-95
```

**Icon Button:**
```css
width: 44px
height: 44px
border-radius: 8px
display: flex
align-items: center
justify-content: center
active:scale-90
```

### Form Inputs

**Text Input:**
```css
padding: 12px 16px
border: 2px solid gray-200
border-radius: 8px
font-size: 16px (prevent zoom on iOS)
focus:border-primary-500
focus:ring-4 ring-primary-100
transition: all 200ms
```

**Floating Label Input:**
- Label starts inside input
- Moves up and shrinks when focused or has value
- Smooth transition: 200ms

**Date/Time Picker:**
- Native mobile pickers
- Custom styled trigger button
- Icon indicator

### Modals & Sheets

**Bottom Sheet:**
```css
position: fixed
bottom: 0
left: 0
right: 0
background: white
border-radius: 24px 24px 0 0
padding: 24px
max-height: 90vh
shadow: 2xl
animation: slide-up 300ms ease-out
```

**Features:**
- Drag handle at top (32px wide, 4px tall, gray-300)
- Swipe down to dismiss
- Backdrop overlay (black with 40% opacity)
- Smooth spring animation

### Loading States

**Skeleton Loader:**
```css
background: linear-gradient(
  90deg,
  gray-200 0%,
  gray-100 50%,
  gray-200 100%
)
animation: shimmer 1.5s infinite
border-radius: 8px
```

**Spinner:**
- Size: 24px (small), 32px (medium), 48px (large)
- Color: Primary-500
- Animation: spin 1s linear infinite

**Pull-to-Refresh:**
- Spinner appears at top
- Pulls down 80px before triggering
- Smooth spring animation on release

### Toast Notifications

**Design:**
```css
position: fixed
top: 16px (or bottom: 80px above nav)
left: 16px
right: 16px
padding: 16px
border-radius: 12px
shadow: xl
animation: slide-in 300ms ease-out
```

**Variants:**
- Success: Green background, checkmark icon
- Error: Red background, X icon
- Info: Blue background, info icon
- Warning: Yellow background, warning icon

**Auto-dismiss:** 3-5 seconds

### Status Badges

```css
padding: 4px 12px
border-radius: 9999px
font-size: 12px
font-weight: 600
```

**Colors:**
- Confirmed: Green background, dark green text
- Pending: Yellow background, dark yellow text
- Cancelled: Red background, dark red text
- Completed: Gray background, dark gray text

### Avatars

**Sizes:**
- xs: 24px
- sm: 32px
- md: 48px
- lg: 64px
- xl: 96px

**Features:**
- Circular border-radius
- Border: 2px white (for overlapping avatars)
- Placeholder: Initials with colored background
- Status indicator (8px dot) for online/offline

## Page Layouts

### Dashboard

```
┌─────────────────────────────────────┐
│  Good morning, Sarah! 👋            │
│  Monday, November 1, 2025           │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 🩺 Next Appointment          │   │
│  │ Dr. Smith - Cardiology       │   │
│  │ Today at 2:00 PM             │   │
│  │         [Join Video]         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Quick Actions                      │
│  [📅 Book] [👨‍⚕️ Doctors] [📋 Records]│
├─────────────────────────────────────┤
│  Recent Vitals                      │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ BP   │ │ HR   │ │ Temp │       │
│  │120/80│ │ 72   │ │ 98.6 │       │
│  └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────┤
│  Upcoming Appointments              │
│  [Appointment Card 1]               │
│  [Appointment Card 2]               │
└─────────────────────────────────────┘
```

### Doctor Search

```
┌─────────────────────────────────────┐
│  ← Find Doctors                     │
├─────────────────────────────────────┤
│  🔍 Search by name or specialty     │
├─────────────────────────────────────┤
│  [Cardiology] [Dermatology] [...]   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 👨‍⚕️ Dr. John Smith          │   │
│  │ Cardiology                   │   │
│  │ ⭐ 4.8 (120 reviews)         │   │
│  │         [Book Now]           │   │
│  └─────────────────────────────┘   │
│  [More doctor cards...]             │
└─────────────────────────────────────┘
```

### Appointment Booking

```
┌─────────────────────────────────────┐
│  ← Book Appointment                 │
├─────────────────────────────────────┤
│  👨‍⚕️ Dr. John Smith                │
│  Cardiology • $150                  │
├─────────────────────────────────────┤
│  Select Date                        │
│  [Calendar Widget]                  │
├─────────────────────────────────────┤
│  Available Times                    │
│  [9:00] [10:00] [11:00] [2:00]     │
├─────────────────────────────────────┤
│  Consultation Type                  │
│  ○ In-Person  ● Video  ○ Phone     │
├─────────────────────────────────────┤
│  Reason for Visit                   │
│  [Text Input]                       │
├─────────────────────────────────────┤
│         [Confirm Booking]           │
└─────────────────────────────────────┘
```

## Animations & Micro-interactions

### Page Transitions

```css
/* Slide from right */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Button Press

```css
button:active {
  transform: scale(0.95);
  transition: transform 100ms ease-out;
}
```

### Card Hover/Press

```css
.card:active {
  transform: scale(0.98);
  shadow: lg;
  transition: all 150ms ease-out;
}
```

### Shimmer Loading

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

### Modal Slide Up

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

### Success Checkmark

```css
@keyframes check-scale {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

## Interaction Patterns

### Pull-to-Refresh

1. User pulls down on scrollable content
2. Spinner appears and rotates
3. Content refreshes
4. Spinner disappears with smooth animation
5. Content slides back to position

### Swipe to Dismiss

1. User swipes left/right on card or modal
2. Element follows finger with resistance
3. If swipe > 50% width, dismiss
4. Otherwise, spring back to position
5. Haptic feedback on dismiss

### Long Press

1. User presses and holds element
2. After 500ms, show context menu
3. Haptic feedback when menu appears
4. Menu slides up from bottom

### Infinite Scroll

1. User scrolls to bottom
2. Loading spinner appears
3. New content loads
4. Spinner disappears
5. Content animates in

## Accessibility

### Touch Targets

- Minimum size: 44x44px
- Spacing between targets: 8px minimum
- Visual feedback within 100ms

### Color Contrast

- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States

- Visible focus ring: 2px solid primary-500
- Focus ring offset: 2px
- Skip to content link

### Screen Reader

- Semantic HTML elements
- ARIA labels for icons
- Live regions for dynamic content
- Descriptive button text

## Performance

### Image Optimization

- Use Next.js Image component
- Lazy load images below fold
- Blur placeholder for avatars
- WebP format with fallback

### Animation Performance

- Use transform and opacity only
- Avoid animating layout properties
- Use will-change sparingly
- 60fps target

### Bundle Size

- Code split by route
- Dynamic import heavy components
- Tree shake unused code
- Optimize icon imports

## Implementation Files

### CSS Variables File
`app/globals.css` - Define all design tokens

### Component Files
- `components/ui/bottom-nav.tsx`
- `components/ui/sheet.tsx`
- `components/ui/toast.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/badge.tsx`
- `components/ui/avatar.tsx`
- `components/ui/floating-input.tsx`

### Animation Utilities
`lib/utils/animations.ts` - Reusable animation functions

### Hook Files
- `lib/hooks/use-toast.ts`
- `lib/hooks/use-haptic.ts`
- `lib/hooks/use-pull-to-refresh.ts`

## Mobile-Specific Considerations

### Safe Areas

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### PWA Considerations

- Add to home screen prompt
- Splash screen with brand colors
- Status bar styling
- Offline support indicators

### Haptic Feedback

```typescript
// Light tap
navigator.vibrate(10)

// Medium tap
navigator.vibrate(20)

// Success
navigator.vibrate([10, 50, 10])

// Error
navigator.vibrate([50, 100, 50])
```

## Testing Strategy

### Visual Regression

- Storybook for component library
- Chromatic for visual testing
- Test all component states

### Interaction Testing

- Test touch targets on real devices
- Verify animations are smooth
- Test gestures (swipe, pull-to-refresh)
- Verify haptic feedback

### Accessibility Testing

- Lighthouse accessibility audit
- Screen reader testing (VoiceOver)
- Keyboard navigation
- Color contrast validation

### Performance Testing

- Lighthouse performance score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Animation frame rate 60fps

