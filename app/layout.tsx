import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = {
  title: {
    default: "Patient Portal - Healthcare Management",
    template: "%s | Patient Portal"
  },
  description: "Manage your healthcare journey with our comprehensive patient portal. Book appointments, access medical records, consult with doctors via video, and connect with the health community.",
  keywords: ["healthcare", "patient portal", "telemedicine", "medical records", "appointments", "video consultation"],
  authors: [{ name: "Healthcare Platform" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Patient Portal - Healthcare Management",
    description: "Manage your healthcare journey with our comprehensive patient portal",
    siteName: "Patient Portal",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Patient Portal",
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
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
      <body className="antialiased">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <AuthKitProvider>{children}</AuthKitProvider>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
