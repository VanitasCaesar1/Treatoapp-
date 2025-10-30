import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { DashboardStats } from '@/components/features/dashboard/dashboard-stats';
import { UpcomingAppointments } from '@/components/features/dashboard/upcoming-appointments';
import { RecentVitals } from '@/components/features/dashboard/recent-vitals';
import { QuickActions } from '@/components/features/dashboard/quick-actions';

export default async function DashboardPage() {
  const { user } = await withAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.firstName || 'Patient'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your health dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <UpcomingAppointments />

        {/* Recent Vitals */}
        <RecentVitals />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
