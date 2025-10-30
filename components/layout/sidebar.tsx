'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <aside className={cn("w-64 border-r bg-card min-h-screen flex-col", className)}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Patient Portal</h2>
      </div>
      <nav className="px-3 space-y-1" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
