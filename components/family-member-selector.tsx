'use client';

import React, { useState } from 'react';
import { FamilyMember } from '@/lib/types/family-member';
import { Card } from '@/components/ui/card';
import { Check, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FamilyMemberForm } from '@/components/family-member-form';

interface FamilyMemberSelectorProps {
    members: FamilyMember[];
    selectedId: string;
    onChange: (memberId: string) => void;
    onAddMember?: (member: FamilyMember) => void;
}

export function FamilyMemberSelector({ members, selectedId, onChange, onAddMember }: FamilyMemberSelectorProps) {
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddMember = (member: FamilyMember) => {
        if (onAddMember) {
            onAddMember(member);
        }
        setShowAddForm(false);
    };

    // Only show "Myself" (no other family members)
    const hasOnlySelf = members.length === 1 && members[0].id === 'self';

    return (
        <>
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Book Appointment For</label>

                <div className="space-y-2">
                    {members.map((member) => (
                        <button
                            key={member.id}
                            type="button"
                            onClick={() => onChange(member.id)}
                            className={cn(
                                "w-full p-4 rounded-xl border-2 transition-all text-left",
                                selectedId === member.id
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        selectedId === member.id ? "bg-blue-100" : "bg-gray-100"
                                    )}>
                                        <User className={cn(
                                            "w-5 h-5",
                                            selectedId === member.id ? "text-blue-600" : "text-gray-500"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-500 capitalize">{member.relationship}</div>
                                    </div>
                                </div>
                                {selectedId === member.id && (
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}

                    {/* Add Family Member Button */}
                    {onAddMember && (
                        <button
                            type="button"
                            onClick={() => setShowAddForm(true)}
                            className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                    <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                                        Add Family Member
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Book for someone else
                                    </div>
                                </div>
                            </div>
                        </button>
                    )}
                </div>

                {hasOnlySelf && onAddMember && (
                    <p className="text-xs text-gray-500 text-center">
                        💡 You can add family members to book appointments for them
                    </p>
                )}
            </div>

            {/* Add Member Dialog */}
            {onAddMember && (
                <FamilyMemberForm
                    open={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onSave={handleAddMember}
                />
            )}
        </>
    );
}
