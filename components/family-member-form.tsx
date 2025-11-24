'use client';

import React, { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FloatingLabelInput } from '@/components/ui/input-floating';
import { SelectMobile, SelectMobileOption } from '@/components/ui/select-mobile';
import { Button } from '@/components/ui/button';
import { FamilyMember, FamilyMemberInput } from '@/lib/types/family-member';

interface FamilyMemberFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (member: FamilyMember) => void;
    member?: FamilyMember;
}

const relationshipOptions: SelectMobileOption[] = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' },
];

const genderOptions: SelectMobileOption[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

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

export function FamilyMemberForm({ open, onClose, onSave, member }: FamilyMemberFormProps) {
    const [formData, setFormData] = useState<FamilyMemberInput>({
        name: member?.name || '',
        relationship: member?.relationship === 'self' ? 'spouse' : (member?.relationship || 'child'),
        dateOfBirth: member?.dateOfBirth || '',
        gender: member?.gender || undefined,
        bloodGroup: member?.bloodGroup || '',
        phone: member?.phone || '',
        email: member?.email || '',
    });

    const handleSave = () => {
        if (!formData.name || !formData.relationship) {
            return;
        }

        const newMember: FamilyMember = {
            id: member?.id || crypto.randomUUID(),
            name: formData.name,
            relationship: formData.relationship,
            dateOfBirth: formData.dateOfBirth || undefined,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup as any,
            phone: formData.phone,
            email: formData.email,
        };

        onSave(newMember);
        onClose();
    };

    return (
        <BottomSheet
            isOpen={open}
            onClose={onClose}
            title={member ? 'Edit Family Member' : 'Add Family Member'}
            size="lg"
        >
            <div className="space-y-4 pb-6">
                <FloatingLabelInput
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    helperText="Enter family member's full name"
                />

                <SelectMobile
                    label="Relationship"
                    value={formData.relationship}
                    onChange={(value) => setFormData({ ...formData, relationship: value as any })}
                    options={relationshipOptions}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />

                    <SelectMobile
                        label="Gender"
                        value={formData.gender || ''}
                        onChange={(value) => setFormData({ ...formData, gender: value as any })}
                        options={genderOptions}
                        placeholder="Select"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SelectMobile
                        label="Blood Group"
                        value={formData.bloodGroup}
                        onChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                        options={bloodGroupOptions}
                        placeholder="Select"
                    />

                    <FloatingLabelInput
                        label="Phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, phone: value });
                        }}
                    />
                </div>

                <FloatingLabelInput
                    label="Email (Optional)"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-medical-blue hover:bg-medical-blue-dark"
                        onClick={handleSave}
                        disabled={!formData.name || !formData.relationship}
                    >
                        {member ? 'Update' : 'Add'} Member
                    </Button>
                </div>
            </div>
        </BottomSheet>
    );
}
