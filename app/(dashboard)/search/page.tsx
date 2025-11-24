'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, ArrowUpDown, MapPin } from 'lucide-react';
import { DoctorSearchFilters } from '@/components/features/doctors/doctor-search-filters';
import { DoctorCard } from '@/components/features/doctors/doctor-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showToast } from '@/lib/utils/toast';
import { SearchPageSkeleton } from '@/components/skeletons/Skeletons';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/lib/hooks/use-haptics';

export default function DoctorsPage() {
  const [filters, setFilters] = useState<any>({
    page: 1,
    pageSize: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const { selectionChanged } = useHaptics();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (filters.query || '')) {
        handleFiltersChange({ ...filters, query: searchQuery });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDoctors = async (searchFilters: any, append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query params
      const params: any = {};
      if (searchFilters.query) params.q = searchFilters.query;
      if (searchFilters.specialty) params.specialty = searchFilters.specialty;
      if (searchFilters.location) params.location = searchFilters.location;
      if (searchFilters.availability) params.availability = searchFilters.availability;
      if (searchFilters.rating) params.rating = searchFilters.rating;
      if (searchFilters.experience) params.experience = searchFilters.experience;

      // Pagination
      const limit = searchFilters.pageSize || 20;
      const offset = ((searchFilters.page || 1) - 1) * limit;
      params.limit = limit;
      params.offset = offset;

      const response = await fetch('/api/doctors/search?' + new URLSearchParams(params), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch doctors');

      const data = await response.json();
      let doctorsList = data.doctors || [];

      // Fetch fees for each doctor (parallel)
      const doctorsWithFees = await Promise.all(
        doctorsList.map(async (doc: any) => {
          try {
            const feesResponse = await fetch(`/api/doctors/${doc.id}/fees`, {
              credentials: 'include',
            });

            if (!feesResponse.ok) {
              return { ...doc, price: null };
            }

            const feesData = await feesResponse.json();

            // Handle different response formats
            let consultationFee = null;

            if (feesData.fees && Array.isArray(feesData.fees) && feesData.fees.length > 0) {
              // Find consultation fee
              const consultationFeeObj = feesData.fees.find((f: any) =>
                f.consultation_fee || f.amount || f.fee || f.default_fees
              );

              if (consultationFeeObj) {
                consultationFee = consultationFeeObj.consultation_fee
                  || consultationFeeObj.amount
                  || consultationFeeObj.fee
                  || consultationFeeObj.default_fees;
              }
            } else if (feesData.consultation_fee) {
              consultationFee = feesData.consultation_fee;
            } else if (feesData.amount) {
              consultationFee = feesData.amount;
            }

            return {
              ...doc,
              price: consultationFee
            };
          } catch (e) {
            console.error(`Failed to fetch fees for doctor ${doc.id}:`, e);
            return {
              ...doc,
              price: null
            };
          }
        })
      );

      if (append) {
        setDoctors(prev => [...prev, ...doctorsWithFees]);
      } else {
        setDoctors(doctorsWithFees);
      }

      setTotal(data.total || 0);
      setHasMore((data.count || 0) >= limit);
    } catch (error: any) {
      console.error('Failed to load doctors:', error.message);
      setError(error.message);
      if (!append) {
        setDoctors([]);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(filters);
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchDoctors(updatedFilters);
    selectionChanged();
  };

  const handleLoadMore = () => {
    const nextPage = (filters.page || 1) + 1;
    const updatedFilters = { ...filters, page: nextPage };
    setFilters(updatedFilters);
    fetchDoctors(updatedFilters, true);
  };

  const handleRefresh = useCallback(async () => {
    selectionChanged();
    await fetchDoctors(filters);
  }, [filters]);

  const { containerRef, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleSortChange = (value: string) => {
    setSortBy(value);
    selectionChanged();
    const sorted = [...doctors].sort((a, b) => {
      switch (value) {
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'experience_desc': return (b.years_of_experience || 0) - (a.years_of_experience || 0);
        case 'name_asc': return (a.name || '').localeCompare(b.name || '');
        default: return 0;
      }
    });
    setDoctors(sorted);
  };

  return (
    <div ref={containerRef} className="min-h-screen pb-20 -mx-4 px-4 bg-gray-50/30">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md -mx-4 px-4 pt-4 pb-0 shadow-sm transition-all">
        {/* Search Input */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors, specialties, clinics..."
            className="pl-10 pr-10 h-12 rounded-2xl bg-gray-100 border-transparent focus:bg-white focus:border-medical-blue focus:ring-4 focus:ring-blue-50 transition-all text-base"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <DoctorSearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Pull to refresh indicator */}
      <div className={cn(
        "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100 my-2" : "opacity-0 h-0 my-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
      </div>

      {/* Results Content */}
      <div className="mt-4 space-y-4">
        {isLoading && doctors.length === 0 ? (
          <SearchPageSkeleton />
        ) : doctors.length > 0 ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-medium text-gray-500">
                Found <span className="text-gray-900 font-bold">{total}</span> specialists
              </p>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs border-none bg-transparent shadow-none hover:bg-gray-100 rounded-full px-3">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="relevance">Best Match</SelectItem>
                  <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  <SelectItem value="experience_desc">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Cards */}
            <div className="space-y-3">
              {doctors.map((doctor: any, index: number) => (
                <DoctorCard key={doctor.id || `doctor-${index}`} doctor={doctor} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-6 pb-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="rounded-full px-8 border-gray-200 hover:bg-gray-50 hover:text-medical-blue"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Show More Results'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              We couldn't find any doctors matching "{filters.query}". Try adjusting your filters or search terms.
            </p>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setSearchQuery('');
                setFilters({ page: 1, pageSize: 20 });
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
