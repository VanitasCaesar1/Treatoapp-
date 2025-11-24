import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Share content using native share sheet
 */
export async function shareContent(options: {
  title: string;
  text: string;
  url?: string;
  dialogTitle?: string;
}) {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return { success: true };
      } catch (error) {
        console.error('Web share failed:', error);
        return { success: false, error };
      }
    }
    
    // Fallback: copy to clipboard
    if (options.url) {
      await navigator.clipboard.writeText(options.url);
      return { success: true, fallback: 'clipboard' };
    }
    
    return { success: false, error: 'Share not supported' };
  }

  try {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || 'Share',
    });
    return { success: true };
  } catch (error) {
    console.error('Native share failed:', error);
    return { success: false, error };
  }
}

/**
 * Share doctor profile
 */
export async function shareDoctorProfile(doctor: {
  id: string;
  name: string;
  specialty: string;
}) {
  return shareContent({
    title: `Check out ${doctor.name}`,
    text: `${doctor.name} - ${doctor.specialty}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/doctor/${doctor.id}`,
    dialogTitle: 'Share Doctor',
  });
}

/**
 * Share appointment
 */
export async function shareAppointment(appointment: {
  id: string;
  doctorName: string;
  date: string;
}) {
  return shareContent({
    title: 'Appointment Details',
    text: `Appointment with ${appointment.doctorName} on ${appointment.date}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/appointments/${appointment.id}`,
    dialogTitle: 'Share Appointment',
  });
}
