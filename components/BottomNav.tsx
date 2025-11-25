'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Calendar, User, Home, Activity } from 'lucide-react';
import { useCapacitor } from '@/lib/capacitor';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();
    const capacitor = useCapacitor();

    const tabs = [
        {
            name: 'Home',
            href: '/dashboard',
            icon: Home,
            activeIcon: Home,
        },
        {
            name: 'Records',
            href: '/medical-records',
            icon: Activity,
            activeIcon: Activity,
        },
        {
            name: 'Appointments',
            href: '/appointments',
            icon: Calendar,
            activeIcon: Calendar,
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User,
            activeIcon: User,
        },
    ];

    const handleTabClick = () => {
        capacitor.lightHaptic();
    };

    if (pathname === '/login' || pathname === '/') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            {/* Gradient fade at the bottom to blend content */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

            <div className="relative px-4 pb-safe pt-2 pointer-events-auto">
                <nav className="mx-auto max-w-md bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full mb-4 px-2 py-2 flex justify-between items-center supports-[backdrop-filter]:bg-white/70">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href || (tab.href === '/dashboard' && pathname === '/dashboard');
                        const Icon = tab.icon;

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
    );
}
