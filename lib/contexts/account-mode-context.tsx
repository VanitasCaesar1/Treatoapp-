'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserRoles } from '@/lib/hooks/use-user-roles';

type AccountMode = 'patient' | 'doctor' | 'admin';

interface AccountModeContextType {
    mode: AccountMode;
    setMode: (mode: AccountMode) => void;
    isDoctor: boolean;
    canSwitchMode: boolean;
}

const AccountModeContext = createContext<AccountModeContextType | undefined>(undefined);

export function AccountModeProvider({ children }: { children: ReactNode }) {
    const { isDoctor } = useUserRoles();
    const [mode, setModeState] = useState<AccountMode>('patient');

    useEffect(() => {
        // Load saved mode preference
        const savedMode = localStorage.getItem('account_mode') as AccountMode;
        if (savedMode && isDoctor) {
            setModeState(savedMode);
        }
    }, [isDoctor]);

    const setMode = (newMode: AccountMode) => {
        if (!isDoctor && newMode === 'doctor') {
            // Can't switch to doctor mode if not a doctor
            return;
        }
        setModeState(newMode);
        localStorage.setItem('account_mode', newMode);
    };

    return (
        <AccountModeContext.Provider
            value={{
                mode,
                setMode,
                isDoctor,
                canSwitchMode: isDoctor,
            }}
        >
            {children}
        </AccountModeContext.Provider>
    );
}

export function useAccountMode() {
    const context = useContext(AccountModeContext);
    if (context === undefined) {
        throw new Error('useAccountMode must be used within AccountModeProvider');
    }
    return context;
}
