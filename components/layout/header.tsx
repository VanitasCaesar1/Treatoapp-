'use client';

import { Bell, Search, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCapacitor } from '@/lib/capacitor';
import { useUserSession } from '@/lib/contexts/user-session-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [location, setLocation] = useState('Location');
  const capacitor = useCapacitor();
  const { user } = useUserSession();

  // Hide header on pages with their own integrated headers
  const hideHeaderPages = ['/search'];
  if (hideHeaderPages.some(page => pathname?.includes(page))) {
    return null;
  }

  useEffect(() => {
    const getLocation = async () => {
      const position = await capacitor.getCurrentPosition();
      if (position) {
        const name = await capacitor.getLocationName(position.latitude, position.longitude);
        setLocation(name);
      }
    };
    getLocation();
  }, [capacitor]);

  const handleBackClick = () => {
    capacitor.lightHaptic();
    router.back();
  };

  const handleNotificationClick = () => {
    capacitor.lightHaptic();
    // TODO: Navigate to notifications
  };

  const handleLocationClick = () => {
    capacitor.lightHaptic();
    // TODO: Open location picker
  };

  const getPageTitle = () => {
    if (pathname?.includes('/search/') && pathname?.split('/').length > 3) return 'Doctor Profile';
    if (pathname?.includes('/search')) return 'Search';
    if (pathname?.includes('/appointments/book')) return 'Book Appointment';
    if (pathname?.includes('/appointments/') && pathname?.split('/').length > 3) return 'Appointment Details';
    if (pathname?.includes('/appointments')) return 'Appointments';
    if (pathname?.includes('/medical-records/') && pathname?.split('/').length > 3) return 'Record Details';
    if (pathname?.includes('/medical-records')) return 'Medical Records';
    if (pathname?.includes('/profile')) return 'Profile';
    if (pathname?.includes('/video')) return 'Video Call';
    return 'Home';
  };

  const showBackButton = () => {
    // Show back button on detail pages
    return pathname?.includes('/doctors/') && pathname?.split('/').length > 3 ||
      pathname?.includes('/appointments/') && pathname?.split('/').length > 3 ||
      pathname?.includes('/medical-records/') && pathname?.split('/').length > 3 ||
      pathname?.includes('/appointments/book');
  };

  const showSearch = () => {
    // Show search on list pages
    return pathname?.includes('/search') ||
      pathname?.includes('/appointments') ||
      pathname?.includes('/medical-records');
  };

  const isSearchPage = pathname === '/search';
  const isDashboard = pathname === '/dashboard';

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-safe border-b border-gray-200 transition-all duration-200 tap-highlight-none shadow-sm"
      role="banner"
    >
      <div className="pt-safe"></div>
      <div className="px-4 py-3">
        {isSearchPage ? (
          // Search page - Airbnb-style search bar
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, hospitals..."
                className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-full text-sm placeholder:text-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue transition-all border border-gray-200"
              />
            </div>
            <button
              onClick={handleNotificationClick}
              className="touch-target rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all relative flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-airbnb-red rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        ) : isDashboard ? (
          // Dashboard - App name, location, notification
          <div className="flex items-center justify-between relative">
            <h1 className="text-xl font-bold bg-gradient-to-r from-medical-blue to-medical-blue-light bg-clip-text text-transparent tracking-tight">
              Treato
            </h1>

            <button
              onClick={handleLocationClick}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gray-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer select-none-touch"
              aria-label="Change location"
            >
              <MapPin className="h-3.5 w-3.5 text-medical-blue" />
              <span className="text-xs font-semibold text-gray-700">{location}</span>
            </button>

            <button
              onClick={handleNotificationClick}
              className="touch-target rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-airbnb-red rounded-full" />
              )}
            </button>
          </div>
        ) : (
          // Other pages - Simple header with back button
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton() && (
                <button
                  onClick={handleBackClick}
                  className="touch-target rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-700" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>

            <button className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all relative">
              <Bell className="h-5 w-5 text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-airbnb-red rounded-full" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
