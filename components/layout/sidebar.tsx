'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Users,
  FileText,
  Video,
  MessageSquare,
  Pill,
  FileStack,
  User,
  LogOut,
} from 'lucide-react';

export const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    name: 'Doctors',
    href: '/doctors',
    icon: Users,
  },
  {
    name: 'Medical Records',
    href: '/medical-records',
    icon: FileText,
  },
  {
    name: 'Video Consultation',
    href: '/video',
    icon: Video,
  },
  {
    name: 'Community',
    href: '/community',
    icon: MessageSquare,
  },
  {
    name: 'Medicines',
    href: '/medicines',
    icon: Pill,
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: FileStack,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    // Navigate to WorkOS sign out route
    router.push('/api/auth/signout');
  };

  return (
    <aside className={cn("w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col", className)}>
      <div className="px-6 py-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-medical-blue to-medical-blue-light flex items-center justify-center shadow-medical transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900">Treato</h2>
            <p className="text-xs text-gray-500 font-medium">Patient Portal</p>
          </div>
        </Link>
      </div>

      <nav className="px-4 py-6 space-y-1 flex-1" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-medical-blue/10 text-medical-blue'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-medical-blue" : "text-gray-400 group-hover:text-gray-600"
                )}
                aria-hidden="true"
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-6 pt-4 border-t border-gray-100 space-y-3">
        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          {loggingOut ? 'Logging out...' : 'Log Out'}
        </button>

        {/* Help Section */}
        <div className="px-4 py-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="font-semibold mb-1 text-gray-900 text-sm">Need help?</p>
          <p className="text-xs text-gray-500 mb-3">Our support team is here for you 24/7.</p>
          <Link href="/support" className="text-medical-blue hover:text-medical-blue-dark transition-colors text-sm font-semibold flex items-center gap-1">
            Contact support
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}