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
  Edit3,
  Loader2,
  Fingerprint,
  ShieldCheck,
  LogOut,
  FileText,
  FlaskConical,
  CreditCard,
  Settings,
  ChevronRight,
  QrCode,
  AlertTriangle,
  RefreshCw,
  Download,
  Share2
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
import { Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [emergencyQR, setEmergencyQR] = useState<{
    qr_data: string;
    emergency_url: string;
    expires_at: string;
  } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
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

  const generateEmergencyQR = useCallback(async () => {
    if (!profile?.patient?.id) return;
    
    try {
      setQrLoading(true);
      const response = await fetch(`/api/emergency/patients/${profile.patient.id}/qr`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmergencyQR(data);
        setShowQRModal(true);
        showToast.success('Emergency QR generated', 'qr-success');
      } else {
        throw new Error('Failed to generate QR');
      }
    } catch (error) {
      console.error('Failed to generate emergency QR:', error);
      showToast.error('Failed to generate emergency QR', 'qr-error');
    } finally {
      setQrLoading(false);
    }
  }, [profile?.patient?.id]);

  const shareEmergencyQR = async () => {
    if (!emergencyQR) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Medical Info',
          text: 'My emergency medical information QR code',
          url: emergencyQR.emergency_url,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(emergencyQR.emergency_url);
      showToast.success('Link copied to clipboard', 'link-copied');
    }
  };

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

  const handleLogout = () => {
    setLoggingOut(true);
    // Navigate to WorkOS sign out route
    router.push('/api/auth/signout');
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
              <div className="relative inline-block">
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
                      "rounded-full px-3 py-1 flex items-center gap-1 shadow-lg",
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
              { icon: Calendar, label: 'Appointments', color: 'text-blue-600', bg: 'bg-blue-50', href: '/appointments' },
              { icon: FileText, label: 'Prescriptions', color: 'text-purple-600', bg: 'bg-purple-50', href: '/medical-records' },
              { icon: FlaskConical, label: 'Lab Reports', color: 'text-teal-600', bg: 'bg-teal-50', href: '/lab-reports' },
              { icon: CreditCard, label: 'Payments', color: 'text-orange-600', bg: 'bg-orange-50', href: '/payments' }
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-2 group"
              >
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

          {/* 5. Emergency QR Code Section */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-5 shadow-sm border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Emergency QR</h3>
                  <p className="text-xs text-gray-500">Quick access to vital medical info</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Generate a QR code that emergency responders can scan to view your critical medical information including blood group, allergies, and emergency contacts.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={generateEmergencyQR}
                disabled={qrLoading || !profile?.patient?.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11"
              >
                {qrLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                {emergencyQR ? 'View QR Code' : 'Generate QR'}
              </Button>
              
              {emergencyQR && (
                <Button
                  variant="outline"
                  onClick={shareEmergencyQR}
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-11"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {emergencyQR && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                Expires: {new Date(emergencyQR.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* 6. Settings / Account Status */}
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
            <Button
              variant="outline"
              className="w-full rounded-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 font-medium"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loggingOut ? 'Logging out...' : 'Log Out'}
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

      {/* Emergency QR Modal */}
      {showQRModal && emergencyQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency QR Code</h3>
              <p className="text-sm text-gray-500 mb-6">
                Scan this code to access emergency medical information
              </p>
              
              {/* QR Code Display */}
              <div className="bg-white border-4 border-gray-100 rounded-2xl p-4 mb-4 inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(emergencyQR.emergency_url)}`}
                  alt="Emergency QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={shareEmergencyQR}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateEmergencyQR}
                    disabled={qrLoading}
                    className="border-gray-200 rounded-xl"
                  >
                    {qrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => setShowQRModal(false)}
                  className="w-full text-gray-500"
                >
                  Close
                </Button>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Valid until {new Date(emergencyQR.expires_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}