'use client';

import { FloatingLabelInput } from '@/components/ui/input-floating';
import { SelectMobile, SelectMobileOption } from '@/components/ui/select-mobile';
import { useFormValidation, commonRules } from '@/lib/hooks/use-form-validation';

interface EditableProfileFormProps {
    profile: any;
    onChange: (profile: any) => void;
}

const bloodGroupOptions: SelectMobileOption[] = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
];

export function EditableProfileForm({ profile, onChange }: EditableProfileFormProps) {
    const handleChange = (field: string, value: any) => {
        onChange({ ...profile, [field]: value });
    };

    return (
        <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
                <FloatingLabelInput
                    label="First Name"
                    type="text"
                    value={profile?.first_name || ''}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                />

                <FloatingLabelInput
                    label="Last Name"
                    type="text"
                    value={profile?.last_name || ''}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                />
            </div>

            {/* Email Field */}
            <FloatingLabelInput
                label="Email Address"
                type="email"
                inputMode="email"
                value={profile?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
            />

            {/* Phone Number */}
            <FloatingLabelInput
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={profile?.mobile || ''}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleChange('mobile', value);
                }}
                helperText="Enter 10-digit mobile number"
            />

            {/* Blood Group and Age */}
            <div className="grid grid-cols-2 gap-4">
                <SelectMobile
                    label="Blood Group"
                    value={profile?.blood_group || ''}
                    onChange={(value) => handleChange('blood_group', value)}
                    options={bloodGroupOptions}
                    placeholder="Select"
                />

                <FloatingLabelInput
                    label="Age"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={150}
                    value={profile?.age?.toString() || ''}
                    onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleChange('age', value);
                    }}
                />
            </div>

            {/* Aadhaar ID */}
            <FloatingLabelInput
                label="Aadhaar ID"
                type="tel"
                inputMode="numeric"
                maxLength={12}
                value={profile?.aadhaar_id || ''}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleChange('aadhaar_id', value);
                }}
                helperText="12-digit Aadhaar number"
                className="font-mono"
            />
        </div>
    );
}
