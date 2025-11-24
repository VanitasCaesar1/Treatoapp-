# Implementation Plan

- [-] 1. Set up design system foundation
  - [ ] 1.1 Create CSS variables for design tokens
    - Update `app/globals.css` with color palette variables (primary, secondary, accent, semantic, neutral)
    - Add typography variables (font sizes, weights, line heights)
    - Add spacing scale variables (4px base unit system)
    - Add border radius variables (sm, md, lg, xl, full)
    - Add shadow variables (sm, md, lg, xl, 2xl)
    - Add animation timing variables (durations and easing functions)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 1.2 Update Tailwind configuration
    - Modify `tailwind.config.ts` to extend theme with custom colors
    - Add custom spacing scale
    - Add custom border radius values
    - Add custom shadow values
    - Configure animation utilities
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Create enhanced UI components
  - [ ] 2.1 Create bottom navigation component
    - Implement `components/ui/bottom-nav.tsx` with fixed positioning
    - Add navigation items with icons and labels
    - Implement active state styling with primary color
    - Add safe area padding for notched devices
    - Add smooth transition animations between items
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 2.2 Create bottom sheet component
    - Implement `components/ui/sheet.tsx` with slide-up animation
    - Add drag handle at top
    - Implement swipe-to-dismiss gesture
    - Add backdrop overlay with opacity transition
    - Add spring-based animation for natural feel
    - _Requirements: 2.4, 3.3_
  
  - [ ] 2.3 Create toast notification component
    - Implement `components/ui/toast.tsx` with variants (success, error, info, warning)
    - Add slide-in animation from top or bottom
    - Implement auto-dismiss with configurable duration
    - Add icon for each variant
    - Create toast hook `lib/hooks/use-toast.ts` for easy usage
    - _Requirements: 6.1, 6.2_
  
  - [ ] 2.4 Create skeleton loader component
    - Implement `components/ui/skeleton.tsx` with shimmer animation
    - Create variants for different content types (text, card, avatar, list)
    - Add configurable width and height props
    - Implement smooth shimmer animation with gradient
    - _Requirements: 2.3, 6.4_
  
  - [ ] 2.5 Create status badge component
    - Implement `components/ui/badge.tsx` with color variants
    - Add variants for appointment statuses (confirmed, pending, cancelled, completed)
    - Style with pill shape and appropriate colors
    - Add icon support for badges
    - _Requirements: 5.3_
  
  - [ ] 2.6 Create avatar component
    - Implement `components/ui/avatar.tsx` with multiple sizes (xs, sm, md, lg, xl)
    - Add circular border radius
    - Implement placeholder with initials and colored background
    - Add status indicator dot for online/offline
    - Add image loading state
    - _Requirements: 5.4_
  
  - [ ] 2.7 Create floating label input component
    - Implement `components/ui/floating-input.tsx` with animated label
    - Add label animation that moves up when focused or has value
    - Style with focus states (border color, ring)
    - Add error state styling
    - Add helper text and error message display
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 3. Enhance existing card components
  - [ ] 3.1 Update appointment card styling
    - Modify `components/features/appointments/appointment-card.tsx` with new design
    - A