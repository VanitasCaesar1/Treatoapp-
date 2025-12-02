'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  Edit3,
  Loader2,
  Fingerprint,
  ShieldCheck,
  LogOut,
  Users,
  FileText,
  FlaskConical,
  CreditCard,
  Settings,
  ChevronRight
} from 'lucide-react';
import { showToast } from '@/lib/utils/toast';
import { useCapacitor } from '@/lib/capacitor';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ErrorDisplay } from '@/components/error/error-display';
import { FamilyMemberList } from '@/components/family-member-list';
import { FamilyMemberForm } from '@/components/family-member-form';
import { FamilyMember } from '@/lib/types/family-member';
import { EditableProfileForm } from '@/components/profile/editable-profile-form';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { useAccountMode } from '@/lib/contexts/account-mode-context';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AccountSwitcher } from '@/components/navigation/account-switcher';
import { Stethoscope } from 'lucide-react';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const capacitor = useCapacitor();
  const { isDoctor, roles } = useUserRoles();
  const { mode, setMode } = useAccountMode();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the optimized profile API route
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();

        // If profile doesn't exist, try to create it
        if (errorData.code === 'PROFILE_NOT_FOUND') {
          console.log('Profile not found, attempting to create...');
          const createResponse = await fetch('/api/user/profile/ensure', {
            method: 'POST',
            credentials: 'include',
          });

          if (createResponse.ok) {
            const { profile: newProfile } = await createResponse.json();
            setProfile(newProfile);
            setEditedProfile(newProfile.user);  // Set to user object for editing
            showToast.success('Profile created successfully', 'profile-created');
            return;
          }
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const profileData = await response.json();
      setProfile(profileData);
      setEditedProfile(profileData.user);  // Set to user object for editing
      setFamilyMembers(profileData.family_members || []);
    } catch (error: any) {
      console.error('Failed to load profile:', error.message);
      setError(error.message || 'Unable to connect to server');
      showToast.error('Failed to load profile data', 'profile-error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkBiometric = useCallback(async () => {
    const available = await capacitor.isBiometricAvailable();
    setBiometricAvailable(available);
    if (available) {
      const enabled = await capacitor.isBiometricEnabled();
      setBiometricEnabled(enabled);
    }
  }, []); // capacitor is now stable

  useEffect(() => {
    fetchProfile();
    checkBiometric();
  }, [fetchProfile, checkBiometric]);

  const { containerRef, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await fetchProfile();
      await checkBiometric();
    },
  });

  if (error && !profile) {
    return (
      <ErrorDisplay
        title="Connection Problem"
        message="Can't connect to our servers right now. Check your internet and try again."
        onRetry={() => window.location.reload()}
        variant="page"
      />
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refetch the profile since backend returns success, not updated data
      await fetchProfile();
      setIsEditing(false);
      showToast.success('Profile updated successfully', 'profile-success');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast.error('Failed to update profile', 'profile-update-error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile.user);
    setIsEditing(false);
  };

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      // Enable biometric
      const result = await capacitor.authenticateWithBiometric('Enable biometric login');
      if (result.success) {
        await capacitor.setBiometricEnabled(true);
        setBiometricEnabled(true);
        showToast.success('Biometric login enabled', 'biometric-enabled');
      } else {
        showToast.error('Biometric authentication failed', 'biometric-failed');
      }
    } else {
      // Disable biometric
      await capacitor.setBiometricEnabled(false);
      setBiometricEnabled(false);
      showToast.success('Biometric login disabled', 'biometric-disabled');
    }
  };

  const handleSaveFamilyMember = async (member: FamilyMember) => {
    try {
      const isExisting = familyMembers.some(m => m.id === member.id);

      let response;
      if (isExisting) {
        // Update existing member
        response = await fetch(`/api/user/family-members/${member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(member),
        });
      } else {
        // Add new member
        response = await fetch('/api/user/family-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(member),
        });
      }

      if (response.ok) {
        showToast.success(isExisting ? 'Family member updated' : 'Family member added', 'family-saved');
        // Refetch profile to get updated family members
        await fetchProfile();
        setShowFamilyForm(false);
        setEditingMember(undefined);
      } else {
        throw new Error('Failed to save family member');
      }
    } catch (error) {
      console.error('Failed to save family member:', error);
      showToast.error('Failed to save family member', 'family-error');
    }
  };

  const handleDeleteFamilyMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/user/family-members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showToast.success('Family member removed', 'family-removed');
        // Refetch profile to get updated family members
        await fetchProfile();
      } else {
        throw new Error('Failed to remove family member');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      showToast.error('Failed to delete family member', 'family-delete-error');
    }
  };

  const handleEditFamilyMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowFamilyForm(true);
  };

  // Role switching logic
  type AccountMode = 'patient' | 'doctor' | 'admin';
  const availableRoles = roles.filter((r: string) => r !== 'patient'); // Exclude patient as it's default
  const hasMultipleRoles = availableRoles.length >= 1; // Has doctor/admin etc.

  // Double-tap: Cycle through roles
  const handleAvatarDoubleTap = () => {
    if (!hasMultipleRoles) return;

    // Cycle through: patient → doctor → admin → ... → patient
    const modeOrder: AccountMode[] = ['patient', 'doctor', 'admin'];
    const currentIndex = modeOrder.indexOf(mode as AccountMode);
    const nextIndex = (currentIndex + 1) % modeOrder.length;
    const nextMode = modeOrder[nextIndex];

    // Check if user has this role
    if (nextMode === 'patient' || roles.includes(nextMode)) {
      setMode(nextMode);
      showToast.success(`Switched to ${nextMode} mode`, 'mode-switch');

      // Navigate to appropriate dashboard
      if (nextMode === 'doctor') {
        window.location.href = '/doctor/dashboard';
      } else if (nextMode === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard/dashboard';
      }
    } else {
      // Skip to next
      handleAvatarDoubleTap();
    }
  };

  // Long press: Show modal
  const handleAvatarLongPress = () => {
    if (hasMultipleRoles) {
      setShowAccountSwitcher(true);
    }
  };

  // Touch handlers for double-tap and long-press
  const handleAvatarTouchStart = () => {
    if (!hasMultipleRoles) return;

    // Start long press timer
    const longPressTimer = setTimeout(() => {
      handleAvatarLongPress();
    }, 500); // 500ms for long press

    setTapTimer(longPressTimer);
  };

  const handleAvatarTouchEnd = () => {
    if (!hasMultipleRoles) return;

    // Clear long press timer
    if (tapTimer) {
      clearTimeout(tapTimer);
      setTapTimer(null);
    }

    // Detect double tap
    setTapCount(prev => prev + 1);

    if (tapCount + 1 === 2) {
      // Double tap detected!
      handleAvatarDoubleTap();
      setTapCount(0);
    } else {
      // Reset after 300ms
      const resetTimer = setTimeout(() => setTapCount(0), 300);
      setTimeout(() => clearTimeout(resetTimer), 301);
    }
  };

  const handleAvatarClick = () => {
    // For desktop: just show modal if has multiple roles
    if (hasMultipleRoles) {
      setShowAccountSwitcher(true);
    }
  };

  return (
    <div ref={containerRef} className="min-h-[calc(100vh-140px)] pb-24 space-y-6">
      {/* Pull to refresh indicator */}
      <div className={cn(
        "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100 mb-4" : "opacity-0 h-0 mb-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <SkeletonCard className="h-48 rounded-3xl" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-32" />
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">

          {/* 1. New Clean Header */}
          <div className="flex flex-col items-center pt-4 pb-2 relative">
            {/* Edit Button (Absolute Top Right) */}
            <div className="absolute top-0 right-0">
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-medical-blue hover:bg-blue-50 rounded-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:bg-gray-100 rounded-full"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-medical-blue hover:bg-medical-blue-dark rounded-full shadow-sm text-white"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {/* Avatar & Name */}
            <div className="relative mb-3">
              <div
                onTouchStart={handleAvatarTouchStart}
                onTouchEnd={handleAvatarTouchEnd}
                onClick={handleAvatarClick}
                className={cn(
                  "relative inline-block select-none",
                  hasMultipleRoles && "cursor-pointer active:scale-95 transition-transform"
                )}
              >
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                  <AvatarImage src={profile?.user?.profile_pic || ''} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue font-bold">
                    {getInitials(profile?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                  <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                </div>
                {/* Doctor/Admin indicator badge */}
                {hasMultipleRoles && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className={cn(
                      "rounded-full px-3 py-1 flex items-center gap-1 shadow-lg animate-pulse",
                      mode === 'doctor' && "bg-green-600",
                      mode === 'admin' && "bg-purple-600",
                      mode === 'patient' && isDoctor && "bg-gray-600"
                    )}>
                      {mode === 'doctor' && <Stethoscope className="h-3 w-3 text-white" />}
                      {mode === 'admin' && <ShieldCheck className="h-3 w-3 text-white" />}
                      <span className="text-[10px] text-white font-semibold uppercase tracking-wide">
                        {mode}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hint text for role switching */}
              {hasMultipleRoles && (
                <p className="text-[10px] text-gray-400 text-center mt-3">
                  Double tap to switch • Long press for menu
                </p>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 text-center">
              {profile?.user?.name || 'User'}
            </h1>
            <p className="text-gray-500 text-sm font-medium mb-2">@{profile?.user?.username || ''}</p>

            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
              mode === 'doctor'
                ? 'bg-green-50 text-green-600 border-green-100'
                : 'bg-blue-50 text-blue-600 border-blue-100'
            )}>
              {mode === 'doctor' ? 'Doctor' : 'Patient'} Account
            </span>
          </div>

          {/* 2. Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-3 px-1">
            {[
              { icon: Calendar, label: 'Appointments', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: FileText, label: 'Prescriptions', color: 'text-purple-600', bg: 'bg-purple-50' }, // Need to import FileText
              { icon: FlaskConical, label: 'Lab Reports', color: 'text-teal-600', bg: 'bg-teal-50' }, // Need to import FlaskConical
              { icon: CreditCard, label: 'Payments', color: 'text-orange-600', bg: 'bg-orange-50' } // Need to import CreditCard
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 transition-all group-active:scale-95", action.bg)}>
                  <action.icon className={cn("h-6 w-6", action.color)} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>

          {/* 3. Personal Information */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center mb-5">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="font-bold text-gray-900 text-lg">Personal Info</h3>
            </div>

            {/* Dynamic Import for Form Components */}
            {isEditing ? (
              <EditableProfileForm
                profile={editedProfile}
                onChange={setEditedProfile}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{profile?.user?.mobile || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{profile?.user?.email || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Blood Group</p>
                      <p className="text-sm font-semibold text-gray-900">{profile?.user?.blood_group || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Age</p>
                      <p className="text-sm font-semibold text-gray-900">{profile?.user?.age || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Aadhaar ID</p>
                    <p className="text-sm font-mono font-medium text-gray-900 tracking-wider">{profile?.user?.aadhaar_id || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Family Members Section (Horizontal) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-gray-900 text-lg">Family Members</h3>
              <span className="text-xs font-medium text-gray-400">{familyMembers.length} members</span>
            </div>

            <FamilyMemberList
              members={familyMembers}
              onEdit={handleEditFamilyMember}
              onDelete={handleDeleteFamilyMember}
              onAdd={() => {
                setEditingMember(undefined);
                setShowFamilyForm(true);
              }}
            />
          </div>

          {/* 5. Settings / Account Status */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="font-bold text-gray-900 text-lg">Settings</h3>
            </div>

            {/* Biometric Toggle */}
            {biometricAvailable && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Biometric Login</p>
                    <p className="text-xs text-gray-500">FaceID / TouchID</p>
                  </div>
                </div>
                <Switch checked={biometricEnabled} onCheckedChange={toggleBiometric} />
              </div>
            )}

            {/* Address (Simplified) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Saved Address</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {profile?.address || 'No address saved'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="pt-4 pb-8">
            <Button variant="outline" className="w-full rounded-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 font-medium">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Version 1.0.0 • Treato Patient App
            </p>
          </div>
        </div>
      )}

      {/* Family Member Form Modal */}
      <FamilyMemberForm
        open={showFamilyForm}
        onClose={() => setShowFamilyForm(false)}
        onSave={handleSaveFamilyMember}
        member={editingMember}
      />

      {/* Account Switcher Modal - Only shows for users with multiple roles */}
      {hasMultipleRoles && (
        <AccountSwitcher open={showAccountSwitcher} onClose={() => setShowAccountSwitcher(false)} />
      )}
    </div>
  );
}