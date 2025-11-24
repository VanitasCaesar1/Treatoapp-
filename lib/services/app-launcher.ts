import { Capacitor } from '@capacitor/core';

/**
 * Open phone dialer
 */
export async function openPhoneDialer(phoneNumber: string) {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const url = `tel:${cleanNumber}`;
  
  if (Capacitor.isNativePlatform()) {
    window.location.href = url;
  } else {
    window.open(url, '_self');
  }
}

/**
 * Open email client
 */
export async function openEmail(email: string, subject?: string, body?: string) {
  let url = `mailto:${email}`;
  const params = new URLSearchParams();
  
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  window.location.href = url;
}

/**
 * Open maps with location
 */
export async function openMaps(address: string) {
  const encodedAddress = encodeURIComponent(address);
  
  if (Capacitor.getPlatform() === 'ios') {
    window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
  } else if (Capacitor.getPlatform() === 'android') {
    window.location.href = `geo:0,0?q=${encodedAddress}`;
  } else {
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }
}

/**
 * Open maps with coordinates
 */
export async function openMapsWithCoordinates(lat: number, lng: number, label?: string) {
  if (Capacitor.getPlatform() === 'ios') {
    window.location.href = `maps://maps.apple.com/?ll=${lat},${lng}&q=${label || 'Location'}`;
  } else if (Capacitor.getPlatform() === 'android') {
    window.location.href = `geo:${lat},${lng}?q=${lat},${lng}(${label || 'Location'})`;
  } else {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  }
}

/**
 * Open external URL in browser
 */
export async function openExternalUrl(url: string) {
  if (Capacitor.isNativePlatform()) {
    // Use in-app browser if available
    window.open(url, '_blank');
  } else {
    window.open(url, '_blank');
  }
}
