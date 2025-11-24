import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
