'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Search, Activity, User } from 'lucide-react';
import { useHaptics } from '@/lib/hooks/use-haptics';
import { useUserSession } from '@/lib/contexts/user-session-context';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const haptics = useHaptics();
  const { user: userProfile } = useUserSession();

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Gradient fade at the bottom to blend content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

      <div className="relative px-4 pb-safe pt-2 pointer-events-auto">
        <div className="mx-auto max-w-md bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full mb-4 px-2 py-2 flex justify-between items-center supports-[backdrop-filter]:bg-white/70">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

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
                  {item.isAvatar ? (
                    <div className={cn(
                      "relative transition-all duration-300",
                      isActive ? "scale-110" : ""
                    )}>
                      <Avatar className={cn(
                        "h-6 w-6 border-2 transition-colors duration-300",
                        isActive ? "border-blue-600" : "border-transparent"
                      )}>
                        <AvatarImage src={userProfile?.profilePictureUrl} />
                        <AvatarFallback className={cn(
                          "text-[9px] font-bold",
                          isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                        )}>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "stroke-[2.5px] scale-110" : "stroke-2"
                      )}
                    />
                  )}

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
  );
}