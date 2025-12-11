'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, ArrowUpDown, MapPin, Building2, Stethoscope, Star, ChevronRight, Navigation } from 'lucide-react';
import { DoctorSearchFilters } from '@/components/features/doctors/doctor-search-filters';
import { DoctorCard } from '@/components/features/doctors/doctor-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchPageSkeleton } from '@/components/skeletons/Skeletons';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/lib/hooks/use-haptics';
import { SkeletonCard } from '@/components/ui/skeleton';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLocation } from '@/lib/contexts/location-context';
import { LocationBar } from '@/components/location/location-prompt-drawer';

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface Hospital {
  id: string;
  name: string;
  address?: string;
  city?: string;
  rating?: number;
  total_reviews?: number;
  specialties?: string[];
  image?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export default function DoctorsPage() {
  const [searchType, setSearchType] = useState<'doctors' | 'hospitals'>('doctors');
  const [filters, setFilters] = useState<any>({
    page: 1,
    pageSize: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [hospitalSortBy, setHospitalSortBy] = useState('relevance');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const { selectionChanged } = useHaptics();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { location } = useLocation();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchType === 'doctors') {
        if (searchQuery !== (filters.query || '')) {
          handleFiltersChange({ ...filters, query: searchQuery });
        }
      } else {
        fetchHospitals(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  // Fetch hospitals with distance calculation
  const fetchHospitals = async (query: string = '') => {
    setHospitalsLoading(true);
    try {
      const params: any = { q: query, limit: 50 };
      // Pass location to API if available
      if (location) {
        params.lat = location.latitude;
        params.lng = location.longitude;
      }
      const data = await api.get('/hospitals/search', params);
      let hospitalList = data.hospitals || [];
      
      // Calculate distance for each hospital if we have user location
      if (location) {
        hospitalList = hospitalList.map((h: Hospital) => {
          if (h.latitude && h.longitude) {
            const dist = calculateDistance(
              location.latitude,
              location.longitude,
              h.latitude,
              h.longitude
            );
            return { ...h, distance: Math.round(dist * 10) / 10 };
          }
          return h;
        });
        
        // Sort by distance by default when location is available
        if (hospitalSortBy === 'distance' || hospitalSortBy === 'relevance') {
          hospitalList.sort((a: Hospital, b: Hospital) => {
            if (a.distance === undefined) return 1;
            if (b.distance === undefined) return -1;
            return a.distance - b.distance;
          });
        }
      }
      
      setHospitals(hospitalList);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  };

  // Load hospitals when switching to hospitals tab or location changes
  useEffect(() => {
    if (searchType === 'hospitals') {
      fetchHospitals(searchQuery);
    }
  }, [searchType, location]);

  // Handle hospital sort change
  const handleHospitalSortChange = (value: string) => {
    setHospitalSortBy(value);
    selectionChanged();
    const sorted = [...hospitals].sort((a, b) => {
      switch (value) {
        case 'distance':
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
    setHospitals(sorted);
  };

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
      if (searchFilters.distance) params.distance = searchFilters.distance;
      
      // Pass user location for distance calculation
      if (location) {
        params.lat = location.latitude;
        params.lng = location.longitude;
      }

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

      // Fetch fees for each doctor (parallel) and calculate distance
      const doctorsWithFees = await Promise.all(
        doctorsList.map(async (doc: any) => {
          let doctorData = { ...doc };
          
          // Calculate distance if we have user location and doctor location
          if (location && doc.latitude && doc.longitude) {
            const dist = calculateDistance(
              location.latitude,
              location.longitude,
              doc.latitude,
              doc.longitude
            );
            doctorData.distance = Math.round(dist * 10) / 10;
          }
          
          try {
            const feesResponse = await fetch(`/api/doctors/${doc.id}/fees`, {
              credentials: 'include',
            });

            if (!feesResponse.ok) {
              return { ...doctorData, price: null };
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
              ...doctorData,
              price: consultationFee
            };
          } catch (e) {
            console.error(`Failed to fetch fees for doctor ${doc.id}:`, e);
            return {
              ...doctorData,
              price: null
            };
          }
        })
      );
      
      // Sort by distance if sortBy is distance and we have location
      let finalDoctors = doctorsWithFees;
      if (location && (searchFilters.sortBy === 'distance' || sortBy === 'distance')) {
        finalDoctors = [...doctorsWithFees].sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }

      if (append) {
        setDoctors(prev => [...prev, ...finalDoctors]);
      } else {
        setDoctors(finalDoctors);
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

  // Refetch doctors when location changes
  useEffect(() => {
    if (searchType === 'doctors') {
      fetchDoctors(filters);
    }
  }, [location]);

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
        case 'distance':
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
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
        {/* Location Bar */}
        <div className="flex items-center justify-between mb-3">
          <LocationBar />
          {location && (
            <span className="text-xs text-gray-500">
              Showing results near you
            </span>
          )}
        </div>
        
        {/* Search Type Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => { setSearchType('doctors'); selectionChanged(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              searchType === 'doctors'
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <Stethoscope className="h-4 w-4" />
            Doctors
          </button>
          <button
            onClick={() => { setSearchType('hospitals'); selectionChanged(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              searchType === 'hospitals'
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <Building2 className="h-4 w-4" />
            Hospitals
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchType === 'doctors' ? "Search doctors, specialties..." : "Search hospitals, clinics..."}
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

        {/* Filters - only for doctors */}
        {searchType === 'doctors' && (
          <DoctorSearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
        )}
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
        {/* Hospital Results */}
        {searchType === 'hospitals' ? (
          hospitalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : hospitals.length > 0 ? (
            <div className="space-y-3">
              {/* Results Header with Sort */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-medium text-gray-500">
                  Found <span className="text-gray-900 font-bold">{hospitals.length}</span> hospitals
                </p>
                <Select value={hospitalSortBy} onValueChange={handleHospitalSortChange}>
                  <SelectTrigger className="w-[140px] h-8 text-xs border-none bg-transparent shadow-none hover:bg-gray-100 rounded-full px-3">
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="relevance">Best Match</SelectItem>
                    {location && <SelectItem value="distance">Nearest First</SelectItem>}
                    <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {hospitals.map((hospital) => (
                <Link key={hospital.id} href={`/hospital/${hospital.id}`}>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{hospital.name}</h3>
                        {hospital.address && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {hospital.address}{hospital.city && `, ${hospital.city}`}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {/* Distance Badge */}
                          {hospital.distance !== undefined && (
                            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {hospital.distance < 1 
                                ? `${Math.round(hospital.distance * 1000)}m away`
                                : `${hospital.distance} km away`
                              }
                            </span>
                          )}
                          {hospital.rating && (
                            <span className="text-xs text-gray-600 flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {hospital.rating}
                            </span>
                          )}
                          {hospital.specialties && hospital.specialties.length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {hospital.specialties.length} specialties
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No hospitals found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                {searchQuery ? `No hospitals matching "${searchQuery}"` : 'No hospitals available'}
              </p>
            </div>
          )
        ) : isLoading && doctors.length === 0 ? (
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
                  {location && <SelectItem value="distance">Nearest First</SelectItem>}
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
