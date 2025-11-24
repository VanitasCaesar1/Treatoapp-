'use client';

import React from 'react';
import { FamilyMember } from '@/lib/types/family-member';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMemberListProps {
    members: FamilyMember[];
    onEdit: (member: FamilyMember) => void;
    onDelete: (memberId: string) => void;
    onAdd: () => void;
}

const relationshipEmoji: Record<string, string> = {
    self: '👤',
    spouse: '💑',
    child: '👧',
    parent: '👨',
    sibling: '👫',
    other: '👥',
};

const relationshipLabel: Record<string, string> = {
    self: 'Self',
    spouse: 'Spouse',
    child: 'Child',
    parent: 'Parent',
    sibling: 'Sibling',
    other: 'Other',
};

export function FamilyMemberList({ members, onEdit, onDelete, onAdd }: FamilyMemberListProps) {
    return (
        <div className="relative">
            <div className="flex overflow-x-auto pb-4 -mx-5 px-5 gap-3 scrollbar-hide snap-x snap-mandatory">
                {/* Add New Member Card (First Item for easy access or Last? Plan said Last, but First is often better for discovery. Let's stick to Last as per plan to prioritize existing members) */}

                {members.map((member) => (
                    <div key={member.id} className="snap-start shrink-0">
                        <Card className="w-36 h-48 p-3 flex flex-col items-center justify-between relative group overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all">

                            {/* Actions Overlay (visible on hover/focus) */}
                            {member.relationship !== 'self' && (
                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                                        className="p-1.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-blue-600"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
                                        className="p-1.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-red-600"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex-1 flex flex-col items-center justify-center w-full mt-2">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                                    {relationshipEmoji[member.relationship] || '👤'}
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm text-center line-clamp-1 w-full px-1">
                                    {member.name}
                                </h4>
                                <span className="text-xs text-gray-500 font-medium mt-1 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {relationshipLabel[member.relationship]}
                                </span>
                            </div>

                            <div className="w-full mt-2 pt-2 border-t border-gray-50 flex justify-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                {member.gender && <span>{member.gender.slice(0, 1)}</span>}
                                {member.gender && member.bloodGroup && <span>•</span>}
                                {member.bloodGroup && <span>{member.bloodGroup}</span>}
                            </div>
                        </Card>
                    </div>
                ))}

                {/* Add Button Card */}
                <div className="snap-start shrink-0">
                    <button
                        onClick={onAdd}
                        className="w-36 h-48 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-medical-blue hover:border-medical-blue hover:bg-blue-50/50 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Plus className="h-6 w-6 group-hover:text-medical-blue" />
                        </div>
                        <span className="text-sm font-medium">Add Member</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
