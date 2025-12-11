'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, User, Stethoscope, X, Sparkles } from 'lucide-react';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAccountMode } from '@/lib/contexts/account-mode-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

type AccountMode = 'patient' | 'doctor' | 'admin';

interface AccountSwitcherProps {
    open?: boolean;
    onClose?: () => void;
    userName?: string;
    userAvatar?: string;
}

export function AccountSwitcher({ open, onClose, userName, userAvatar }: AccountSwitcherProps = {}) {
    const { isDoctor, loading, roles } = useUserRoles();
    const [mode, setModeState] = useState<AccountMode>('patient');
    const [showSwitcher, setShowSwitcher] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [switchingTo, setSwitchingTo] = useState<AccountMode | null>(null);
    const { setMode: setGlobalMode } = useAccountMode();
    const router = useRouter();

    const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style });
        }
    };

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

    const handleSwitch = async (newMode: AccountMode) => {
        if (newMode === mode) {
            handleClose();
            return;
        }

        triggerHaptic(ImpactStyle.Heavy);
        setSwitching(true);
        setSwitchingTo(newMode);

        // Animate for 800ms then navigate
        await new Promise(resolve => setTimeout(resolve, 800));

        setModeState(newMode);
        setGlobalMode(newMode);
        localStorage.setItem('account_mode', newMode);

        // Navigate to appropriate dashboard
        if (newMode === 'doctor') {
            window.location.href = '/doctor/dashboard';
        } else if (newMode === 'admin') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/dashboard';
        }
    };

    // Only show button if not controlled externally and user has multiple roles
    const hasMultipleRoles = isDoctor || roles.includes('admin');
    if (loading || (!hasMultipleRoles && open === undefined)) return null;

    const accounts = [
        {
            mode: 'patient' as AccountMode,
            label: 'Patient',
            description: 'Book appointments, view records',
            icon: User,
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-500',
        },
        {
            mode: 'doctor' as AccountMode,
            label: 'Doctor',
            description: 'Manage patients, consultations',
            icon: Stethoscope,
            color: 'green',
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50',
            border: 'border-green-500',
        },
    ];

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

            <Dialog open={isOpen} onOpenChange={switching ? undefined : handleClose}>
                <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white rounded-3xl">
                    <AnimatePresence mode="wait">
                        {switching ? (
                            /* Switching Animation */
                            <motion.div
                                key="switching"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-16 px-8"
                            >
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{ 
                                        rotate: { duration: 0.8, ease: "easeInOut" },
                                        scale: { duration: 0.4, repeat: 1 }
                                    }}
                                    className={cn(
                                        "h-20 w-20 rounded-full flex items-center justify-center mb-6",
                                        switchingTo === 'doctor' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                    )}
                                >
                                    {switchingTo === 'doctor' ? (
                                        <Stethoscope className="h-10 w-10 text-white" />
                                    ) : (
                                        <User className="h-10 w-10 text-white" />
                                    )}
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center"
                                >
                                    <p className="text-lg font-bold text-gray-900">
                                        Switching to {switchingTo === 'doctor' ? 'Doctor' : 'Patient'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                                        <Sparkles className="h-4 w-4 text-yellow-500" />
                                        Loading your dashboard...
                                    </p>
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* Account Selection */
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900">Switch Account</h2>
                                    <button
                                        onClick={() => handleClose()}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Current User */}
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 ring-2 ring-white shadow">
                                            <AvatarImage src={userAvatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-bold">
                                                {userName?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{userName || 'User'}</p>
                                            <p className="text-xs text-gray-500">Currently as {mode}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Options */}
                                <div className="p-4 space-y-3">
                                    {accounts.map((account) => {
                                        const isActive = mode === account.mode;
                                        const Icon = account.icon;
                                        
                                        return (
                                            <motion.button
                                                key={account.mode}
                                                onClick={() => handleSwitch(account.mode)}
                                                whileTap={{ scale: 0.98 }}
                                                className={cn(
                                                    'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
                                                    isActive
                                                        ? `${account.border} ${account.bg} shadow-md`
                                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                                                        isActive 
                                                            ? `bg-gradient-to-br ${account.gradient}` 
                                                            : 'bg-gray-100'
                                                    )}>
                                                        <Icon className={cn(
                                                            "h-6 w-6 transition-colors",
                                                            isActive ? 'text-white' : 'text-gray-500'
                                                        )} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-semibold text-gray-900">{account.label}</p>
                                                        <p className="text-xs text-gray-500">{account.description}</p>
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <motion.div 
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className={cn(
                                                            "h-6 w-6 rounded-full flex items-center justify-center",
                                                            `bg-gradient-to-br ${account.gradient}`
                                                        )}
                                                    >
                                                        <Check className="h-4 w-4 text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="px-4 pb-4">
                                    <p className="text-xs text-center text-gray-400">
                                        Double-tap your avatar to quickly switch
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
}
