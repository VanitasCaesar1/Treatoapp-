'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DoctorSearchFilters as Filters } from '@/lib/types/doctor';

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

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Hindi',
  'Arabic',
];

export function DoctorSearchFilters({
  filters,
  onFiltersChange,
}: DoctorSearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    // Search query can be used for general text search if backend supports it
    onFiltersChange({ ...filters });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({
      page: 1,
      pageSize: 20,
    });
  };

  const hasActiveFilters =
    filters.specialty ||
    filters.location ||
    filters.date ||
    filters.minRating ||
    filters.maxFee ||
    (filters.languages && filters.languages.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, specialty, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showAdvanced && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={filters.specialty || ''}
                  onValueChange={(value) =>
                    handleFilterChange('specialty', value || undefined)
                  }
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specialties</SelectItem>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty.toLowerCase()}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City or ZIP code"
                  value={filters.location || ''}
                  onChange={(e) =>
                    handleFilterChange('location', e.target.value || undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Available Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filters.date || ''}
                  onChange={(e) =>
                    handleFilterChange('date', e.target.value || undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minRating">Minimum Rating</Label>
                <Select
                  value={filters.minRating?.toString() || ''}
                  onValueChange={(value) =>
                    handleFilterChange(
                      'minRating',
                      value ? parseFloat(value) : undefined
                    )
                  }
                >
                  <SelectTrigger id="minRating">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    <SelectItem value="3.0">3.0+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFee">Max Consultation Fee</Label>
                <Input
                  id="maxFee"
                  type="number"
                  placeholder="Enter amount"
                  value={filters.maxFee || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxFee',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={filters.languages?.[0] || ''}
                  onValueChange={(value) =>
                    handleFilterChange(
                      'languages',
                      value ? [value] : undefined
                    )
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Any language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Language</SelectItem>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language.toLowerCase()}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
