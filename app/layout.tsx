import type { Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from '@/components/providers/query-provider';
import { CapacitorProvider } from '@/components/providers/capacitor-provider';
import { UserSessionProvider } from '@/lib/contexts/user-session-context';
import { LocationProvider } from '@/lib/contexts/location-context';
import { AccountModeProvider } from '@/lib/contexts/account-mode-context';
import { NetworkStatus } from '@/components/mobile/network-status';
import { DeepLinkHandler } from '@/components/auth/deep-link-handler';



export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0a2540" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Patient Portal" />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden safe-area">
          <UserSessionProvider>
            <LocationProvider>
              <AccountModeProvider>
                <CapacitorProvider>
                  <QueryProvider>
                    <NetworkStatus />
                    <DeepLinkHandler />
                    {children}
                    <Toaster
                      position="top-center"
                      toastOptions={{
                        className: '!bg-white !text-gray-900 !shadow-airbnb-card !rounded-airbnb-lg !border !border-gray-100 !font-medium',
                        duration: 4000,
                        style: {
                          padding: '12px 16px',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#16a34a',
                            secondary: '#f0fdf4',
                          },
                          style: {
                            borderLeft: '4px solid #16a34a',
                          },
                        },
                        error: {
                          duration: 5000,
                          iconTheme: {
                            primary: '#dc2626',
                            secondary: '#fef2f2',
                          },
                          style: {
                            borderLeft: '4px solid #dc2626',
                          },
                        },
                        loading: {
                          style: {
                            borderLeft: '4px solid #3b82f6',
                          },
                        },
                      }}
                      containerStyle={{
                        top: 24,
                      }}
                      reverseOrder={false}
                    />
                  </QueryProvider>
                </CapacitorProvider>
              </AccountModeProvider>
            </LocationProvider>
          </UserSessionProvider>
      </body>
    </html>
  );
}
