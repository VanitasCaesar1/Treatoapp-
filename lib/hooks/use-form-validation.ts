import { useState, useCallback } from 'react';

export type ValidationRule = {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: any) => boolean | string;
    custom?: (value: any, values: Record<string, any>) => boolean | string;
};

export type FieldRules = Record<string, ValidationRule>;

export function useFormValidation<T extends Record<string, any>>(
    initialValues: T,
    rules: FieldRules
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    // Validate a single field
    const validateField = useCallback(
        (name: keyof T, value: any): string | undefined => {
            const fieldRules = rules[name as string];
            if (!fieldRules) return undefined;

            // Required validation
            if (fieldRules.required) {
                if (value === undefined || value === null || value === '') {
                    return typeof fieldRules.required === 'string'
                        ? fieldRules.required
                        : 'This field is required';
                }
            }

            // Skip other validations if field is empty and not required
            if (value === '' || value === null || value === undefined) {
                return undefined;
            }

            // MinLength validation
            if (fieldRules.minLength && value.length < fieldRules.minLength.value) {
                return fieldRules.minLength.message;
            }

            // MaxLength validation
            if (fieldRules.maxLength && value.length > fieldRules.maxLength.value) {
                return fieldRules.maxLength.message;
            }

            // Pattern validation
            if (fieldRules.pattern && !fieldRules.pattern.value.test(value)) {
                return fieldRules.pattern.message;
            }

            // Custom validate function
            if (fieldRules.validate) {
                const result = fieldRules.validate(value);
                if (result !== true) {
                    return typeof result === 'string' ? result : 'Invalid value';
                }
            }

            // Custom validation with access to all values
            if (fieldRules.custom) {
                const result = fieldRules.custom(value, values);
                if (result !== true) {
                    return typeof result === 'string' ? result : 'Invalid value';
                }
            }

            return undefined;
        },
        [rules, values]
    );

    // Validate all fields
    const validateAll = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        Object.keys(rules).forEach((key) => {
            const error = validateField(key as keyof T, values[key]);
            if (error) {
                newErrors[key as keyof T] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [rules, values, validateField]);

    // Handle field change
    const handleChange = useCallback(
        (name: keyof T, value: any) => {
            setValues((prev) => ({ ...prev, [name]: value }));

            // Validate on change if field has been touched
            if (touched[name]) {
                const error = validateField(name, value);
                setErrors((prev) => ({ ...prev, [name]: error }));
            }
        },
        [touched, validateField]
    );

    // Handle field blur
    const handleBlur = useCallback(
        (name: keyof T) => {
            setTouched((prev) => ({ ...prev, [name]: true }));
            const error = validateField(name, values[name]);
            setErrors((prev) => ({ ...prev, [name]: error }));
        },
        [validateField, values]
    );

    // Reset form
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    // Set specific field error
    const setFieldError = useCallback((name: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [name]: error }));
    }, []);

    // Clear all errors
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateField,
        validateAll,
        setFieldError,
        clearErrors,
        reset,
        setValues,
    };
}

// Common validation rules
export const commonRules = {
    email: {
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
        },
    },
    phone: {
        pattern: {
            value: /^[0-9]{10}$/,
            message: 'Phone number must be 10 digits',
        },
    },
    password: {
        minLength: {
            value: 8,
            message: 'Password must be at least 8 characters',
        },
    },
    aadhaar: {
        pattern: {
            value: /^[0-9]{12}$/,
            message: 'Aadhaar must be 12 digits',
        },
    },
};
