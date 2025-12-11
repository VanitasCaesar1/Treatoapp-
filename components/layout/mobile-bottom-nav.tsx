'use client';

import React, { useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Search, Activity, User } from 'lucide-react';
import { useHaptics } from '@/lib/hooks/use-haptics';
import { useUserSession } from '@/lib/contexts/user-session-context';
import { motion } from 'framer-motion';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { useAccountMode } from '@/lib/contexts/account-mode-context';
import { AccountSwitcher } from '@/components/navigation/account-switcher';
import { showToast } from '@/lib/utils/toast';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const haptics = useHaptics();
  const { user: userProfile } = useUserSession();
  const { roles } = useUserRoles();
  const { mode, setMode } = useAccountMode();

  // Double-click and long-press state
  const lastClickTimeRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const hasMultipleRoles = roles.filter((r: string) => r !== 'patient').length >= 1;

  const navItems = useMemo(() => [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Records', href: '/medical-records', icon: Activity },
    { name: 'Account', href: '/profile', icon: User, isAvatar: true },
  ], []);

  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  // Double-tap handler - cycles through roles
  const handleProfileDoubleTap = useCallback(() => {
    if (!hasMultipleRoles) {
      showToast.info('You only have one role', 'single-role');
      return;
    }

    type AccountMode = 'patient' | 'doctor' | 'admin';
    const modeOrder: AccountMode[] = ['patient', 'doctor', 'admin'];
    const currentIndex = modeOrder.indexOf(mode as AccountMode);

    for (let i = 1; i <= modeOrder.length; i++) {
      const nextIndex = (currentIndex + i) % modeOrder.length;
      const nextMode = modeOrder[nextIndex];

      if (nextMode === 'patient' || roles.includes(nextMode)) {
        setMode(nextMode);
        haptics.heavy();
        showToast.success(`Switched to ${nextMode} mode`, 'mode-switch');

        setTimeout(() => {
          if (nextMode === 'doctor') {
            window.location.href = '/doctor/dashboard';
          } else if (nextMode === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/dashboard';
          }
        }, 300);
        return;
      }
    }
  }, [hasMultipleRoles, mode, roles, setMode, haptics]);

  // Long press handler - shows account switcher modal
  const handleProfileLongPress = useCallback(() => {
    if (hasMultipleRoles) {
      haptics.heavy();
      setShowAccountSwitcher(true);
    }
  }, [hasMultipleRoles, haptics]);

  // Profile click handler with double-click detection
  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;

    if (timeSinceLastClick < 400 && timeSinceLastClick > 0) {
      lastClickTimeRef.current = 0;
      handleProfileDoubleTap();
      return;
    }

    lastClickTimeRef.current = now;
    haptics.light();

    // Navigate after delay to allow for double-click
    setTimeout(() => {
      if (lastClickTimeRef.current === now) {
        router.push('/profile');
      }
    }, 250);
  }, [handleProfileDoubleTap, haptics, router]);

  // Touch handlers for long-press
  const handleProfileTouchStart = useCallback(() => {
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      handleProfileLongPress();
    }, 500);
  }, [handleProfileLongPress]);

  const handleProfileTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-safe pt-2 pointer-events-auto">
          <div className="mx-auto max-w-md bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full mb-4 px-2 py-2 flex justify-between items-center supports-[backdrop-filter]:bg-white/70">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const isProfile = item.isAvatar;

              // Profile/Account tab with special handling
              if (isProfile) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={handleProfileClick}
                    onTouchStart={handleProfileTouchStart}
                    onTouchEnd={handleProfileTouchEnd}
                    onTouchCancel={handleProfileTouchEnd}
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full h-12 rounded-full transition-all duration-300 touch-target select-none",
                      isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                    )}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-bottom-nav-indicator"
                        className="absolute inset-0 bg-blue-50 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                      <div className={cn(
                        "relative transition-all duration-300",
                        isActive ? "scale-110" : ""
                      )}>
                        <Avatar className={cn(
                          "h-6 w-6 border-2 transition-colors duration-300 pointer-events-none",
                          isActive ? "border-blue-600" : "border-transparent"
                        )}>
                          <AvatarImage src={userProfile?.profilePictureUrl} />
                          <AvatarFallback className={cn(
                            "text-[9px] font-bold",
                            isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                          )}>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        {/* Role indicator dot */}
                        {hasMultipleRoles && mode !== 'patient' && (
                          <div className={cn(
                            "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white",
                            mode === 'doctor' ? "bg-green-500" : "bg-purple-500"
                          )} />
                        )}
                      </div>

                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[9px] font-bold"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </div>
                  </button>
                );
              }

              // Regular nav items
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => haptics.light()}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-12 rounded-full transition-all duration-300 touch-target select-none-touch",
                    isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                  )}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-bottom-nav-indicator"
                      className="absolute inset-0 bg-blue-50 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "stroke-[2.5px] scale-110" : "stroke-2"
                      )}
                    />

                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-bold"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Account Switcher Modal */}
      {hasMultipleRoles && (
        <AccountSwitcher
          open={showAccountSwitcher}
          onClose={() => setShowAccountSwitcher(false)}
          userName={userProfile?.firstName}
          userAvatar={userProfile?.profilePictureUrl}
        />
      )}
    </>
  );
}
