'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Navigation, X, Check } from 'lucide-react';
import { useLocation } from '@/lib/contexts/location-context';
import { showToast } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
    open: boolean;
    onClose: () => void;
}

export function LocationPicker({ open, onClose }: LocationPickerProps) {
    const { location, isLoading, requestLocation, setManualLocation, clearLocation } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const handleUseCurrentLocation = async () => {
        try {
            await requestLocation();
            showToast.success('Location detected successfully', 'location-success');
            onClose();
        } catch (error) {
            showToast.error('Failed to get location', 'location-error');
        }
    };

    const handleSearchLocation = async () => {
        if (!searchQuery || searchQuery.length < 3) return;

        setSearching(true);
        try {
            // Using Nominatim geocoding service
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            showToast.error('Location search failed', 'search-error');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectLocation = (result: any) => {
        const locationData = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name,
            city: result.address?.city || result.address?.town || result.address?.village,
            area: result.address?.suburb || result.address?.neighbourhood,
        };
        setManualLocation(locationData);
        showToast.success('Location set successfully', 'location-set');
        onClose();
    };

    const handleClearLocation = () => {
        clearLocation();
        showToast.success('Location cleared', 'location-cleared');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-medical-blue" />
                        Select Location
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Location */}
                    {location && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <p className="text-sm font-semibold text-green-900">Current Location</p>
                                    </div>
                                    <p className="text-xs text-green-700">{location.city || location.area}</p>
                                    <p className="text-xs text-green-600 line-clamp-1">{location.address}</p>
                                </div>
                                <button
                                    onClick={handleClearLocation}
                                    className="text-green-600 hover:text-green-700 p-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Auto-detect Button */}
                    <Button
                        onClick={handleUseCurrentLocation}
                        disabled={isLoading}
                        className="w-full bg-medical-blue hover:bg-blue-700 text-white rounded-xl h-12"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Detecting location...
                            </>
                        ) : (
                            <>
                                <Navigation className="h-4 w-4 mr-2" />
                                Use Current Location
                            </>
                        )}
                    </Button>

                    {/* Manual Search */}
                    <div className="relative">
                        <p className="text-sm font-medium text-gray-700 mb-2">Or search manually</p>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                                    placeholder="Enter city or area..."
                                    className="pl-10 h-11 rounded-xl"
                                />
                            </div>
                            <Button
                                onClick={handleSearchLocation}
                                disabled={searching || searchQuery.length < 3}
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4"
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                            </Button>
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Select a location</p>
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectLocation(result)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-medical-blue transition-colors group"
                                    )}
                                >
                                    <p className="font-medium text-sm text-gray-900 group-hover:text-medical-blue">
                                        {result.address?.city || result.address?.town || result.name}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{result.display_name}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Info Text */}
                    <p className="text-xs text-gray-500 text-center">
                        We'll use your location to show nearby doctors and hospitals
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
