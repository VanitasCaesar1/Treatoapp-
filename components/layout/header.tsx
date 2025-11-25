'use client';

import { Search, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCapacitor } from '@/lib/capacitor';
import { useUserSession } from '@/lib/contexts/user-session-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [location, setLocation] = useState('Location');
  const capacitor = useCapacitor();
  const { user } = useUserSession();

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

  // Hide header on pages with their own integrated headers (check after all hooks)
  const hideHeaderPages = ['/search'];
  if (hideHeaderPages.some(page => pathname?.includes(page))) {
    return null;
  }

  const handleBackClick = () => {
    capacitor.lightHaptic();
    router.back();
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
    if (pathname?.includes('/medical-records')) return 'Health Journey';
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
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-200 tap-highlight-none shadow-sm supports-[backdrop-filter]:bg-white/60"
      role="banner"
    >
      <div className="pt-safe"></div>
      <div className="px-4 py-3">
        {isSearchPage ? (
          // Search page - Airbnb-style search bar
          <div className="flex items-center gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search doctors, hospitals..."
                className="w-full h-11 pl-11 pr-4 bg-gray-100/50 rounded-2xl text-sm font-medium placeholder:text-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 transition-all border border-transparent"
              />
            </div>
          </div>
        ) : isDashboard ? (
          // Dashboard - App name, location, notification
          <div className="flex items-center justify-between relative">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
              Treato
            </h1>

            <button
              onClick={handleLocationClick}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gray-100/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/50 hover:bg-white active:scale-95 transition-all cursor-pointer select-none-touch group"
              aria-label="Change location"
            >
              <MapPin className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700 max-w-[120px] truncate">{location}</span>
            </button>
          </div>
        ) : (
          // Other pages - Simple header with back button
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton() && (
                <button
                  onClick={handleBackClick}
                  className="h-10 w-10 rounded-full border border-gray-200/50 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all bg-white/50 backdrop-blur-sm"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-900" />
                </button>
              )}
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
