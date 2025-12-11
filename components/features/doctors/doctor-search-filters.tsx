'use client';

import { useState } from 'react';
import { SlidersHorizontal, Star, MapPin, Calendar, Check, Navigation } from 'lucide-react';
import { useKeyboard } from '@/lib/hooks/use-keyboard';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SelectMobile } from '@/components/ui/select-mobile';
import { FloatingLabelInput } from '@/components/ui/input-floating';
import { DoctorSearchFilters as Filters } from '@/lib/types/doctor';
import { cn } from '@/lib/utils';
import { useLocation } from '@/lib/contexts/location-context';

interface DoctorSearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
];

const QUICK_FILTERS = [
  { label: 'All', filters: {} },
  { label: 'Nearest', filters: { sortBy: 'distance' } },
  { label: 'Top Rated', filters: { rating: 4.5 } },
  { label: 'Experienced', filters: { experience: 10 } },
  { label: 'Cardiology', filters: { specialty: 'cardiology' } },
  { label: 'Dermatology', filters: { specialty: 'dermatology' } },
];

const DISTANCE_OPTIONS = [
  { value: '', label: 'Any Distance' },
  { value: '2', label: 'Within 2 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
];

export function DoctorSearchFilters({
  filters,
  onFiltersChange,
}: DoctorSearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilters, setTempFilters] = useState<Filters>(filters);
  const { hideKeyboard } = useKeyboard();
  const { location } = useLocation();

  // Sync temp filters when sheet opens
  const openFilters = () => {
    setTempFilters(filters);
    setShowAdvanced(true);
  };

  const applyFilters = () => {
    onFiltersChange({ ...tempFilters, page: 1 });
    setShowAdvanced(false);
  };

  const handleTempFilterChange = (key: keyof Filters, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickFilter = async (quickFilters: any) => {
    await hideKeyboard();

    // Check if this quick filter is already active
    if (isQuickFilterActive(quickFilters)) {
      // If clicking "All", do nothing (it's the default)
      if (Object.keys(quickFilters).length === 0) return;

      // Clear specific filters
      const newFilters = { ...filters };
      Object.keys(quickFilters).forEach(key => {
        delete (newFilters as any)[key];
      });
      onFiltersChange({ ...newFilters, page: 1 });
    } else {
      // Apply new filters
      onFiltersChange({ ...filters, ...quickFilters, page: 1 });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: 20,
    });
    setTempFilters({
      page: 1,
      pageSize: 20,
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters =
    filters.specialty ||
    filters.location ||
    filters.rating ||
    filters.experience ||
    (filters as any).distance ||
    (filters as any).sortBy;

  const isQuickFilterActive = (quickFilters: any) => {
    if (Object.keys(quickFilters).length === 0) {
      return !hasActiveFilters && !filters.query;
    }
    return Object.keys(quickFilters).every(
      (key) => filters[key as keyof Filters] === quickFilters[key]
    );
  };

  const activeFilterCount = [
    filters.specialty,
    filters.location,
    filters.rating,
    filters.experience,
    (filters as any).distance,
    (filters as any).sortBy
  ].filter(Boolean).length;

  return (
    <div className="space-y-3 sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-gray-200/50">
      <div className="flex gap-3 items-center">
        {/* Filter Button */}
        <button
          onClick={openFilters}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl border transition-all shrink-0 relative",
            hasActiveFilters
              ? "bg-medical-blue border-medical-blue text-white shadow-md"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Horizontal Scrollable Chips */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pr-4">
            {QUICK_FILTERS.map((qf) => {
              const isActive = isQuickFilterActive(qf.filters);
              return (
                <button
                  key={qf.label}
                  onClick={() => handleQuickFilter(qf.filters)}
                  className={cn(
                    "flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap",
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Filters Bottom Sheet */}
      <BottomSheet
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        title="Filters"
        size="lg"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Specialty */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Check className="h-4 w-4 text-medical-blue" />
                Specialty
              </label>
              <SelectMobile
                label="Select Specialty"
                value={tempFilters.specialty || ''}
                onChange={(val) => handleTempFilterChange('specialty', val)}
                options={[
                  { value: '', label: 'All Specialties' },
                  ...SPECIALTIES.map(s => ({ value: s.toLowerCase(), label: s }))
                ]}
              />
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-medical-blue" />
                Distance
              </label>
              {location ? (
                <SelectMobile
                  label="Maximum Distance"
                  value={(tempFilters as any).distance?.toString() || ''}
                  onChange={(val) => handleTempFilterChange('distance' as any, val ? parseInt(val) : undefined)}
                  options={DISTANCE_OPTIONS}
                />
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">
                    Enable location to filter by distance
                  </p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-medical-blue" />
                Location
              </label>
              <FloatingLabelInput
                label="City or Zip Code"
                value={tempFilters.location || ''}
                onChange={(e) => handleTempFilterChange('location', e.target.value)}
              />
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Star className="h-4 w-4 text-medical-blue" />
                Minimum Rating
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleTempFilterChange('rating', tempFilters.rating === rating ? undefined : rating)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border transition-all",
                      tempFilters.rating === rating
                        ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm font-bold">{rating}+</span>
                    <Star className={cn("h-3 w-3 mt-1", tempFilters.rating === rating ? "fill-yellow-500 text-yellow-500" : "text-gray-400")} />
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-medical-blue" />
                Experience
              </label>
              <SelectMobile
                label="Minimum Experience"
                value={tempFilters.experience?.toString() || ''}
                onChange={(val) => handleTempFilterChange('experience', val ? parseInt(val) : undefined)}
                options={[
                  { value: '', label: 'Any Experience' },
                  { value: '5', label: '5+ Years' },
                  { value: '10', label: '10+ Years' },
                  { value: '15', label: '15+ Years' },
                  { value: '20', label: '20+ Years' },
                ]}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-gray-100 bg-white space-y-3">
            <Button
              className="w-full h-12 rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white font-semibold text-base shadow-lg shadow-blue-200"
              onClick={applyFilters}
            >
              Show Results
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full text-gray-500 hover:bg-gray-50"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
