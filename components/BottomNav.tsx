'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Calendar, User } from 'lucide-react';
import { useCapacitor } from '@/lib/capacitor';

export default function BottomNav() {
    const pathname = usePathname();
    const capacitor = useCapacitor();

    const tabs = [
        {
            name: 'Home',
            href: '/dashboard',
            icon: Search,
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

    // Don't show on non-app pages if needed, but usually good to show
    // Hide on login/onboarding
    if (pathname === '/login' || pathname === '/') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-safe border-t border-gray-200 pb-safe z-50 tap-highlight-none shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href === '/dashboard' && pathname.startsWith('/dashboard'));
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            onClick={handleTabClick}
                            className={`
                                flex flex-col items-center justify-center touch-target w-full
                                space-y-1 py-2 transition-all duration-200
                                active:scale-95 select-none-touch
                                ${isActive
                                    ? 'text-medical-blue'
                                    : 'text-gray-500 active:text-gray-700'
                                }
                            `}
                        >
                            <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                                <Icon
                                    className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
                                />
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-medical-blue rounded-full animate-scale-in" />
                                )}
                            </div>
                            <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
