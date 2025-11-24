'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Doctors',
    href: '/doctors',
    icon: Users,
  },
  {
    label: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-gray-200',
        'pb-safe'
      )}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[44px] min-h-[44px] px-3 py-1',
                'rounded-lg transition-all duration-200',
                'active:scale-95',
                active
                  ? 'text-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all duration-200',
                  active && 'scale-110'
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-xs mt-0.5 transition-all duration-200',
                  active ? 'font-semibold' : 'font-medium'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
