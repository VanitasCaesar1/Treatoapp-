/**
 * Native-like animation configurations for Framer Motion
 */

// iOS-like spring animation
export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Quick snap animation
export const snapTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
};

// Smooth ease animation
export const smoothTransition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.3,
};

// Page transition variants
export const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Modal/Sheet variants
export const modalVariants = {
  initial: { opacity: 0, y: 100, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 100, scale: 0.95 },
};

// Bottom sheet variants
export const bottomSheetVariants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

// Fade variants
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Scale variants (for buttons, cards)
export const scaleVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  tap: { scale: 0.95 },
};

// List item variants (staggered)
export const listItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Container for staggered children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Skeleton pulse animation
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Swipe gesture config
export const swipeConfig = {
  threshold: 50,
  velocity: 500,
};

// Pull to refresh config
export const pullToRefreshConfig = {
  threshold: 80,
  resistance: 2.5,
};
