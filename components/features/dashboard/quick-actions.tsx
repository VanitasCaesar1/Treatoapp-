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
    description: 'Schedule a consultation with a doctor',
    icon: Calendar,
    href: '/appointments/book',
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Find Doctors',
    description: 'Search for healthcare providers',
    icon: Users,
    href: '/doctors',
    color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  },
  {
    title: 'Medical Records',
    description: 'View your health history',
    icon: FileText,
    href: '/medical-records',
    color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Video Consultation',
    description: 'Join a telemedicine session',
    icon: Video,
    href: '/video',
    color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  },
  {
    title: 'Community',
    description: 'Connect with other patients',
    icon: MessageSquare,
    href: '/community',
    color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'Search Medicines',
    description: 'Find medication information',
    icon: Pill,
    href: '/medicines',
    color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Quick action shortcuts"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
                asChild
              >
                <Link 
                  href={action.href}
                  role="listitem"
                  aria-label={`${action.title}: ${action.description}`}
                >
                  <div className={`p-2 rounded-lg ${action.color}`} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
