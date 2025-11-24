import { Header } from '@/components/layout/header';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { DashboardClientWrapper } from '@/components/layout/dashboard-client-wrapper';
import { CallNotificationProvider } from '@/components/providers/CallNotificationProvider';
import { IncomingCallScreen } from '@/components/video/IncomingCallScreen';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  return (
    <CallNotificationProvider>
      <DashboardClientWrapper>
        <div className="flex flex-col min-h-screen bg-gray-50 max-w-[480px] mx-auto">
          <Header />
          <main id="main-content" className="flex-1 px-4 pb-28 pt-2" role="main">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </DashboardClientWrapper>

      {/* Incoming Call Screen Overlay */}
      <IncomingCallScreen />
    </CallNotificationProvider>
  );
}
