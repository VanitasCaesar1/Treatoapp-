'use client';

import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

interface HeaderProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    profilePictureUrl?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.email[0].toUpperCase();

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60" role="banner">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
        {/* Mobile: Logo/Title - Desktop: Menu Button */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-9 w-9"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <h1 className="text-base md:text-xl font-semibold truncate">
            <span className="lg:inline">Welcome back, {user.firstName || 'Patient'}</span>
            <span className="lg:hidden">Patient Portal</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            <span 
              className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" 
              aria-label="You have unread notifications"
            />
          </Button>

          {/* User Avatar - Mobile: Just avatar, Desktop: Avatar + Info */}
          <Button
            variant="ghost"
            className="h-9 px-2 md:px-3 gap-2"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7 md:h-8 md:w-8">
              <AvatarImage src={user.profilePictureUrl || undefined} alt={`${displayName}'s profile picture`} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
          </Button>

          {/* Logout - Desktop only */}
          <div className="hidden lg:block">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
