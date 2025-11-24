'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Search, FileText, User } from 'lucide-react';
import { useHaptics } from '@/lib/hooks/use-haptics';
import { useUserSession } from '@/lib/contexts/user-session-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const haptics = useHaptics();
  const { user: userProfile } = useUserSession();

  const navItems = useMemo(() => [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Records', href: '/medical-records', icon: FileText },
    { name: 'Account', href: '/profile', icon: User, isAvatar: true },
  ], []);

  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(64px + env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-center justify-around h-16 w-full max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => haptics.light()}
              className="flex-1 h-full flex flex-col items-center justify-center relative"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active Indicator - Absolute to prevent layout shift */}
              <div
                className={cn(
                  "absolute top-0 w-8 h-1 bg-medical-blue rounded-b-full transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />

              <div className={cn(
                "flex flex-col items-center gap-1.5 transition-colors duration-200",
                isActive ? "text-medical-blue" : "text-gray-400"
              )}>
                {item.isAvatar ? (
                  <Avatar className={cn(
                    "h-6 w-6 border transition-colors duration-200",
                    isActive ? "border-medical-blue" : "border-transparent"
                  )}>
                    <AvatarImage src={userProfile?.profilePictureUrl} />
                    <AvatarFallback className={cn(
                      "text-[10px] font-medium",
                      isActive ? "bg-medical-blue text-white" : "bg-gray-100 text-gray-500"
                    )}>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                )}
                <span className="text-[10px] font-medium leading-none tracking-tight">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}