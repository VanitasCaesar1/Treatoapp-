'use client';

import { forwardRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, helperText, className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const id = useId();
    const inputId = props.id || id;
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    return (
      <div className={cn('relative', className)}>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'peer w-full px-4 pt-6 pb-2',
            'text-base text-gray-900',
            'bg-white border-2 rounded-lg',
            'transition-all duration-200',
            'placeholder-transparent',
            'focus:outline-none',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
            props.disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={label}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-4 transition-all duration-200 pointer-events-none',
            'text-gray-500',
            isFloating
              ? 'top-2 text-xs font-medium'
              : 'top-1/2 -translate-y-1/2 text-base',
            error && 'text-red-600',
            isFocused && !error && 'text-primary-600'
          )}
        >
          {label}
        </label>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-600 flex items-start gap-1"
            role="alert"
          >
            <span className="inline-block mt-0.5">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

// Floating Textarea variant
export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FloatingTextarea = forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(({ label, error, helperText, className, onFocus, onBlur, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const id = useId();
  const textareaId = props.id || id;
  const isFloating = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    onBlur?.(e);
  };

  return (
    <div className={cn('relative', className)}>
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'peer w-full px-4 pt-6 pb-2',
          'text-base text-gray-900',
          'bg-white border-2 rounded-lg',
          'transition-all duration-200',
          'placeholder-transparent',
          'focus:outline-none',
          'resize-none',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
          props.disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={label}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : helperText
            ? `${textareaId}-helper`
            : undefined
        }
        {...props}
      />
      
      <label
        htmlFor={textareaId}
        className={cn(
          'absolute left-4 transition-all duration-200 pointer-events-none',
          'text-gray-500',
          isFloating
            ? 'top-2 text-xs font-medium'
            : 'top-6 text-base',
          error && 'text-red-600',
          isFocused && !error && 'text-primary-600'
        )}
      >
        {label}
      </label>

      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-start gap-1"
          role="alert"
        >
          <span className="inline-block mt-0.5">⚠</span>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={`${textareaId}-helper`}
          className="mt-1.5 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

FloatingTextarea.displayName = 'FloatingTextarea';
