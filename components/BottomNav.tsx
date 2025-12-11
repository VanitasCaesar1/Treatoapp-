'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, User, Home, Activity } from 'lucide-react';
import { useCapacitor } from '@/lib/capacitor';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { useAccountMode } from '@/lib/contexts/account-mode-context';
import { AccountSwitcher } from '@/components/navigation/account-switcher';
import { showToast } from '@/lib/utils/toast';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const capacitor = useCapacitor();
    const { isDoctor, roles } = useUserRoles();
    const { mode, setMode } = useAccountMode();
    
    // Double-click and long-press state for Profile tab
    const lastClickTimeRef = useRef(0);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
    const longPressTriggeredRef = useRef(false);

    const hasMultipleRoles = roles.filter((r: string) => r !== 'patient').length >= 1;

    const tabs = [
        {
            name: 'Home',
            href: '/dashboard',
            icon: Home,
        },
        {
            name: 'Records',
            href: '/medical-records',
            icon: Activity,
        },
        {
            name: 'Appointments',
            href: '/appointments',
            icon: Calendar,
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User,
        },
    ];

    const handleTabClick = () => {
        capacitor.lightHaptic();
    };

    // Double-tap handler for Profile - cycles through roles
    const handleProfileDoubleTap = useCallback(() => {
        if (!hasMultipleRoles) {
            showToast.info('You only have one role', 'single-role');
            return;
        }

        type AccountMode = 'patient' | 'doctor' | 'admin';
        const modeOrder: AccountMode[] = ['patient', 'doctor', 'admin'];
        const currentIndex = modeOrder.indexOf(mode as AccountMode);
        
        // Find next available role
        for (let i = 1; i <= modeOrder.length; i++) {
            const nextIndex = (currentIndex + i) % modeOrder.length;
            const nextMode = modeOrder[nextIndex];
            
            if (nextMode === 'patient' || roles.includes(nextMode)) {
                setMode(nextMode);
                capacitor.heavyHaptic();
                showToast.success(`Switched to ${nextMode} mode`, 'mode-switch');

                // Navigate to appropriate dashboard
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
    }, [hasMultipleRoles, mode, roles, setMode, capacitor]);

    // Long press handler - shows account switcher modal
    const handleProfileLongPress = useCallback(() => {
        if (hasMultipleRoles) {
            capacitor.heavyHaptic();
            setShowAccountSwitcher(true);
        }
    }, [hasMultipleRoles, capacitor]);

    // Profile tab click handler with double-click detection
    const handleProfileClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // If long press was triggered, don't process as click
        if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
        }
        
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTimeRef.current;
        
        if (timeSinceLastClick < 400 && timeSinceLastClick > 0) {
            // Double click detected!
            lastClickTimeRef.current = 0;
            handleProfileDoubleTap();
            return;
        }
        
        lastClickTimeRef.current = now;
        handleTabClick();
        
        // Single click - navigate after a short delay to allow for double-click
        setTimeout(() => {
            // Only navigate if no second click happened
            if (lastClickTimeRef.current === now) {
                router.push('/profile');
            }
        }, 250);
    }, [handleProfileDoubleTap, router]);

    // Touch handlers for long-press on Profile
    const handleProfileTouchStart = useCallback(() => {
        longPressTriggeredRef.current = false;
        const timer = setTimeout(() => {
            longPressTriggeredRef.current = true;
            handleProfileLongPress();
        }, 500);
        setLongPressTimer(timer);
    }, [handleProfileLongPress]);

    const handleProfileTouchEnd = useCallback(() => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    }, [longPressTimer]);

    if (pathname === '/login' || pathname === '/') return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
                {/* Gradient fade at the bottom to blend content */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

                <div className="relative px-4 pb-safe pt-2 pointer-events-auto">
                    <nav className="mx-auto max-w-md bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full mb-4 px-2 py-2 flex justify-between items-center supports-[backdrop-filter]:bg-white/70">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href || (tab.href === '/dashboard' && pathname === '/dashboard');
                            const Icon = tab.icon;
                            const isProfile = tab.name === 'Profile';

                            // Profile tab gets special handling
                            if (isProfile) {
                                return (
                                    <button
                                        key={tab.name}
                                        type="button"
                                        onClick={handleProfileClick}
                                        onTouchStart={handleProfileTouchStart}
                                        onTouchEnd={handleProfileTouchEnd}
                                        onTouchCancel={handleProfileTouchEnd}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center w-full h-12 rounded-full transition-all duration-300 touch-target select-none",
                                            isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="bottom-nav-indicator"
                                                className="absolute inset-0 bg-blue-50 rounded-full"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}

                                        <div className="relative z-10 flex flex-col items-center gap-0.5">
                                            <Icon
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
                                                    {tab.name}
                                                </motion.span>
                                            )}
                                            {/* Role indicator dot */}
                                            {hasMultipleRoles && mode !== 'patient' && (
                                                <div className={cn(
                                                    "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full",
                                                    mode === 'doctor' ? "bg-green-500" : "bg-purple-500"
                                                )} />
                                            )}
                                        </div>
                                    </button>
                                );
                            }

                            // Regular tabs
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    onClick={handleTabClick}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center w-full h-12 rounded-full transition-all duration-300 touch-target select-none-touch",
                                        isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottom-nav-indicator"
                                            className="absolute inset-0 bg-blue-50 rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}

                                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                                        <Icon
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
                                                {tab.name}
                                            </motion.span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Account Switcher Modal */}
            {hasMultipleRoles && (
                <AccountSwitcher 
                    open={showAccountSwitcher} 
                    onClose={() => setShowAccountSwitcher(false)}
                />
            )}
        </>
    );
}
