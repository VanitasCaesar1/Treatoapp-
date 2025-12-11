import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';

// Appointment reminder types
export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: 'in-person' | 'online';
  hospitalName?: string;
}

const HEALTH_TIPS = [
  "💧 Drink at least 8 glasses of water today to stay hydrated!",
  "🚶‍♂️ Take a 10-minute walk to boost your energy and mood.",
  "🥗 Add colorful vegetables to your meals for better nutrition.",
  "😴 Aim for 7-9 hours of quality sleep tonight.",
  "🧘‍♀️ Take 5 minutes to practice deep breathing and relax.",
  "🦷 Don't forget to brush and floss your teeth twice daily.",
  "👀 Give your eyes a break from screens every 20 minutes.",
  "🏃‍♀️ Move your body for at least 30 minutes today.",
  "🍎 Choose whole fruits over fruit juice for better fiber.",
  "🧴 Apply sunscreen before going outdoors.",
  "🤸‍♂️ Stretch for 5 minutes to improve flexibility.",
  "🥤 Limit sugary drinks and opt for water or herbal tea.",
  "🧠 Challenge your brain with puzzles or learning something new.",
  "👨‍⚕️ Schedule your regular health check-ups.",
  "🍽️ Practice mindful eating - chew slowly and enjoy your food.",
  "💪 Include protein in every meal for sustained energy.",
  "🌿 Spend time in nature to reduce stress.",
  "📱 Reduce screen time before bed for better sleep.",
  "🤗 Connect with loved ones - social health matters too!",
  "🧘 Practice gratitude - write down 3 things you're thankful for.",
];

export async function initializeHealthTipNotifications() {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Notifications only available on native platforms');
    return;
  }

  try {
    // Request permission
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Cancel existing health tip notifications
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] });

    const now = new Date();
    
    // Morning tip at 10 AM
    const morningTime = new Date();
    morningTime.setHours(10, 0, 0, 0);
    if (morningTime <= now) {
      morningTime.setDate(morningTime.getDate() + 1);
    }

    // Evening tip at 10 PM
    const eveningTime = new Date();
    eveningTime.setHours(22, 0, 0, 0);
    if (eveningTime <= now) {
      eveningTime.setDate(eveningTime.getDate() + 1);
    }

    const getRandomTip = () => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: '🌅 Morning Health Tip',
          body: getRandomTip(),
          schedule: {
            at: morningTime,
            every: 'day',
          },
        },
        {
          id: 2,
          title: '🌙 Evening Health Tip',
          body: getRandomTip(),
          schedule: {
            at: eveningTime,
            every: 'day',
          },
        },
      ],
    });

    console.log('✅ Daily health tips scheduled: 10 AM & 10 PM');
  } catch (error) {
    console.error('Failed to schedule health tips:', error);
  }
}


/**
 * Schedule appointment reminder notifications
 * Schedules reminders at: 24 hours before, 1 hour before, and 15 minutes before
 */
export async function scheduleAppointmentReminders(appointment: AppointmentReminder) {
  if (!Capacitor.isNativePlatform()) {
    console.log('Appointment reminders only available on native platforms');
    return;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const appointmentDateTime = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.appointmentTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const notifications: LocalNotificationSchema[] = [];

    // Generate unique IDs based on appointment ID
    const baseId = parseInt(appointment.appointmentId.replace(/\D/g, '').slice(-6)) || Math.floor(Math.random() * 100000);

    // 24 hours before
    const dayBefore = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (dayBefore > now) {
      notifications.push({
        id: baseId + 1,
        title: '📅 Appointment Tomorrow',
        body: `Your ${appointment.appointmentType === 'online' ? 'video consultation' : 'appointment'} with Dr. ${appointment.doctorName} is tomorrow at ${appointment.appointmentTime}`,
        schedule: { at: dayBefore },
        extra: { appointmentId: appointment.appointmentId, type: 'appointment_reminder' }
      });
    }

    // 1 hour before
    const hourBefore = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
    if (hourBefore > now) {
      notifications.push({
        id: baseId + 2,
        title: '⏰ Appointment in 1 Hour',
        body: `Your ${appointment.appointmentType === 'online' ? 'video consultation' : 'appointment'} with Dr. ${appointment.doctorName} starts in 1 hour${appointment.hospitalName ? ` at ${appointment.hospitalName}` : ''}`,
        schedule: { at: hourBefore },
        extra: { appointmentId: appointment.appointmentId, type: 'appointment_reminder' }
      });
    }

    // 15 minutes before
    const fifteenMinBefore = new Date(appointmentDateTime.getTime() - 15 * 60 * 1000);
    if (fifteenMinBefore > now) {
      notifications.push({
        id: baseId + 3,
        title: appointment.appointmentType === 'online' ? '🎥 Video Call Starting Soon!' : '🏥 Appointment Starting Soon!',
        body: appointment.appointmentType === 'online' 
          ? `Your video consultation with Dr. ${appointment.doctorName} starts in 15 minutes. Tap to join.`
          : `Your appointment with Dr. ${appointment.doctorName} starts in 15 minutes${appointment.hospitalName ? ` at ${appointment.hospitalName}` : ''}`,
        schedule: { at: fifteenMinBefore },
        extra: { appointmentId: appointment.appointmentId, type: 'appointment_reminder' }
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`✅ Scheduled ${notifications.length} reminders for appointment ${appointment.appointmentId}`);
    }
  } catch (error) {
    console.error('Failed to schedule appointment reminders:', error);
  }
}

/**
 * Cancel appointment reminders
 */
export async function cancelAppointmentReminders(appointmentId: string) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const baseId = parseInt(appointmentId.replace(/\D/g, '').slice(-6)) || 0;
    await LocalNotifications.cancel({
      notifications: [
        { id: baseId + 1 },
        { id: baseId + 2 },
        { id: baseId + 3 }
      ]
    });
    console.log(`✅ Cancelled reminders for appointment ${appointmentId}`);
  } catch (error) {
    console.error('Failed to cancel appointment reminders:', error);
  }
}

/**
 * Initialize notification listeners
 */
export async function initializeNotificationListeners(onNotificationTap: (appointmentId: string) => void) {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    const extra = notification.notification.extra;
    if (extra?.type === 'appointment_reminder' && extra?.appointmentId) {
      onNotificationTap(extra.appointmentId);
    }
  });
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // For web, use browser notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}
