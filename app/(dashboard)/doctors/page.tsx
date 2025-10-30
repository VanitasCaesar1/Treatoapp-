'use client';

import { useState } from 'react';
import { useSearchDoctors } from '@/lib/hooks/use-doctors';
import { DoctorSearchFilters } from '@/components/features/doctors/doctor-search-filters';
import { DoctorCard } from '@/components/features/doctors/doctor-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { DoctorSearchFilters as Filters } from '@/lib/types/doctor';
import { UserSearch } from 'lucide-react';

export default function DoctorsPage() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading, error, refetch } = useSearchDoctors(filters);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage
          message="Failed to load doctors. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="text-muted-foreground">
          Search for healthcare providers by specialty, location, and availability
        </p>
      </div>

      <DoctorSearchFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {isLoading && !data ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {data.data.length} of {data.total} doctors
            </p>
          </div>

          <div className="grid gap-4">
            {data.data.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          {data.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={UserSearch}
          title="No doctors found"
          description="Try adjusting your search filters to find more results"
        />
      )}
    </div>
  );
}
