'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Calendar,
  Users,
  FileText,
  Video,
  MessageSquare,
  Pill,
} from 'lucide-react';

const quickActions = [
  {
    title: 'Book Appointment',
    description: 'Schedule a consultation',
    icon: Calendar,
    href: '/appointments/book',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Find Doctors',
    description: 'Search healthcare providers',
    icon: Users,
    href: '/doctors',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    title: 'Medical Records',
    description: 'View your health history',
    icon: FileText,
    href: '/medical-records',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Video Call',
    description: 'Join telemedicine session',
    icon: Video,
    href: '/video',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  {
    title: 'Community',
    description: 'Connect with patients',
    icon: MessageSquare,
    href: '/community',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'Medicines',
    description: 'Find medication info',
    icon: Pill,
    href: '/medicines',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
];

export function QuickActions() {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div 
        className="grid grid-cols-3 gap-2"
        role="list"
        aria-label="Quick action shortcuts"
      >
        {quickActions.slice(0, 6).map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              role="listitem"
              aria-label={action.title}
              className="bg-white rounded-airbnb-lg border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-airbnb transition-all active:scale-95"
            >
              <div className="p-2.5 rounded-airbnb bg-medical-blue/10" aria-hidden="true">
                <Icon className="h-5 w-5 text-medical-blue" />
              </div>
              <p className="font-semibold text-xs text-gray-900 text-center leading-tight">
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
