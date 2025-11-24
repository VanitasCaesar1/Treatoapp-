'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
}

export function SearchInput({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 500,
  isLoading = false,
  className,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue]);

  const handleClear = () => {
    setInputValue('');
    onChange('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        )}
        {inputValue && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="h-6 w-6"
            haptic={false}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
