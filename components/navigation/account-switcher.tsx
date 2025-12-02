'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, User, Stethoscope, X } from 'lucide-react';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccountMode } from '@/lib/contexts/account-mode-context';

type AccountMode = 'patient' | 'doctor' | 'admin';

interface AccountSwitcherProps {
    open?: boolean;
    onClose?: () => void;
}

export function AccountSwitcher({ open, onClose }: AccountSwitcherProps = {}) {
    const { isDoctor, loading, roles } = useUserRoles();
    const [mode, setModeState] = useState<AccountMode>('patient');
    const [showSwitcher, setShowSwitcher] = useState(false);
    const { setMode: setGlobalMode } = useAccountMode();
    const router = useRouter();

    useEffect(() => {
        // Load saved preference
        const saved = localStorage.getItem('account_mode') as AccountMode;
        if (saved && (isDoctor || roles.includes('admin'))) {
            setModeState(saved);
        }
    }, [isDoctor, roles]);

    // Use external open state if provided
    const isOpen = open !== undefined ? open : showSwitcher;
    const handleClose = onClose || (() => setShowSwitcher(false));

    const handleSwitch = (newMode: AccountMode) => {
        setModeState(newMode);
        setGlobalMode(newMode);
        handleClose();

        // Save preference
        localStorage.setItem('account_mode', newMode);

        // Navigate to appropriate dashboard
        if (newMode === 'doctor') {
            router.push('/doctor/dashboard');
        } else if (newMode === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard/dashboard');
        }
    };

    // Only show button if not controlled externally and user has multiple roles
    const hasMultipleRoles = isDoctor || roles.includes('admin');
    if (loading || (!hasMultipleRoles && open === undefined)) return null;

    return (
        <>
            {open === undefined && (
                <button
                    onClick={() => setShowSwitcher(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 transition-all shadow-sm"
                >
                    {mode === 'patient' ? (
                        <User className="h-4 w-4 text-gray-700" />
                    ) : mode === 'doctor' ? (
                        <Stethoscope className="h-4 w-4 text-green-600" />
                    ) : (
                        <User className="h-4 w-4 text-purple-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700 capitalize">{mode}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
            )}

            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Switch Account</span>
                            <button
                                onClick={() => handleClose()}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 pt-4">
                        {/* Patient Account */}
                        <button
                            onClick={() => handleSwitch('patient')}
                            className={cn(
                                'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
                                mode === 'patient'
                                    ? 'border-medical-blue bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center",
                                    mode === 'patient' ? 'bg-medical-blue' : 'bg-gray-100'
                                )}>
                                    <User className={cn(
                                        "h-6 w-6",
                                        mode === 'patient' ? 'text-white' : 'text-gray-600'
                                    )} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Patient Account</p>
                                    <p className="text-xs text-gray-500">Book appointments, view records</p>
                                </div>
                            </div>
                            {mode === 'patient' && (
                                <div className="h-6 w-6 rounded-full bg-medical-blue flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </button>

                        {/* Doctor Account */}
                        <button
                            onClick={() => handleSwitch('doctor')}
                            className={cn(
                                'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
                                mode === 'doctor'
                                    ? 'border-green-600 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center",
                                    mode === 'doctor' ? 'bg-green-600' : 'bg-gray-100'
                                )}>
                                    <Stethoscope className={cn(
                                        "h-6 w-6",
                                        mode === 'doctor' ? 'text-white' : 'text-gray-600'
                                    )} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Doctor Account</p>
                                    <p className="text-xs text-gray-500">Manage patients, create posts</p>
                                </div>
                            </div>
                            {mode === 'doctor' && (
                                <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-500 mt-4">
                        You can switch between accounts anytime
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}
