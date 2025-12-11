'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, User, Search, Stethoscope, Clock, FileText, Sparkles, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccountMode } from '@/lib/contexts/account-mode-context';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

// Patient mode navigation
const patientNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Feed',
    href: '/feed',
    icon: Sparkles,
  },
  {
    label: 'Explore',
    href: '/explore',
    icon: Compass,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

// Doctor mode navigation
const doctorNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/doctor/dashboard',
    icon: Stethoscope,
  },
  {
    label: 'Feed',
    href: '/feed',
    icon: Sparkles,
  },
  {
    label: 'Appointments',
    href: '/doctor/appointments',
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
  const { mode } = useAccountMode();

  // Select nav items based on current mode
  const navItems = mode === 'doctor' ? doctorNavItems : patientNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/doctor/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-gray-200',
        'pb-safe shadow-lg'
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
                  ? mode === 'doctor'
                    ? 'text-green-600'
                    : 'text-medical-blue'
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

      {/* Mode indicator */}
      {mode === 'doctor' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-green-600 text-white text-[10px] px-3 py-0.5 rounded-full font-semibold uppercase tracking-wide shadow-lg">
            Doctor Mode
          </div>
        </div>
      )}
    </nav>
  );
}
