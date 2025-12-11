'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2, Navigation, Search, ChevronDown, X } from 'lucide-react';
import { useLocation } from '@/lib/contexts/location-context';
import { showToast } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationPromptDrawerProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function LocationPromptDrawer({ forceShow, onClose }: LocationPromptDrawerProps) {
  const { location, isLoading, requestLocation, setManualLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show drawer if no location and not dismissed
  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }
    
    // Check if user has dismissed before
    const wasDismissed = sessionStorage.getItem('location_prompt_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show after a short delay if no location
    const timer = setTimeout(() => {
      if (!location && !dismissed) {
        setIsOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [location, dismissed, forceShow]);

  const handleClose = () => {
    setIsOpen(false);
    setDismissed(true);
    sessionStorage.setItem('location_prompt_dismissed', 'true');
    onClose?.();
  };

  const handleUseCurrentLocation = async () => {
    try {
      await requestLocation();
      showToast.success('Location detected!', 'location-success');
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      showToast.error('Could not detect location', 'location-error');
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery || searchQuery.length < 3) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (result: any) => {
    const locationData = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || result.name,
      area: result.address?.suburb || result.address?.neighbourhood,
    };
    setManualLocation(locationData);
    showToast.success(`Location set to ${locationData.city || 'selected area'}`, 'location-set');
    setIsOpen(false);
    onClose?.();
  };

  // Popular cities for quick selection
  const popularCities = [
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lng: 77.209 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  ];

  const handleSelectCity = (city: typeof popularCities[0]) => {
    setManualLocation({
      latitude: city.lat,
      longitude: city.lng,
      city: city.name,
    });
    showToast.success(`Location set to ${city.name}`, 'location-set');
    setIsOpen(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="px-5 pb-8 pt-2 overflow-y-auto max-h-[calc(85vh-40px)]">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Set Your Location</h2>
                <p className="text-sm text-gray-500">
                  Find doctors and hospitals near you
                </p>
              </div>

              {/* GPS Button */}
              <Button
                onClick={handleUseCurrentLocation}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 mb-4 shadow-lg shadow-blue-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5 mr-2" />
                    Use Current Location
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Search */}
              <div className="mb-5">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                    placeholder="Search for your city or area..."
                    className="pl-12 pr-20 h-14 rounded-2xl bg-gray-100 border-transparent focus:bg-white focus:border-blue-300 text-base"
                  />
                  <Button
                    onClick={handleSearchLocation}
                    disabled={searching || searchQuery.length < 3}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-900 hover:bg-gray-800"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-5 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-1">Search Results</p>
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <p className="font-semibold text-gray-900">
                        {result.address?.city || result.address?.town || result.name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">{result.display_name}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Cities */}
              {searchResults.length === 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">Popular Cities</p>
                  <div className="grid grid-cols-3 gap-2">
                    {popularCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleSelectCity(city)}
                        className="p-3 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-center"
                      >
                        <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Compact location bar to show current location and allow changing
export function LocationBar() {
  const { location } = useLocation();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <MapPin className={cn("h-4 w-4", location ? "text-green-600" : "text-gray-500")} />
        <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
          {location?.city || location?.area || 'Set location'}
        </span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      <LocationPromptDrawer forceShow={showPicker} onClose={() => setShowPicker(false)} />
    </>
  );
}
