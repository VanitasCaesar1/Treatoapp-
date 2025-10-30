import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default async function LoginPage() {
  const signInUrl = await getSignInUrl();
  
  // This will redirect immediately, but we provide a fallback UI
  redirect(signInUrl);
  
  // Fallback UI (shown briefly during redirect)
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Patient Health</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your healthcare dashboard, book appointments, and manage your medical records securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Redirecting to secure login...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
