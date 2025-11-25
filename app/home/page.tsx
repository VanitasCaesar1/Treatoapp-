import { redirect } from 'next/navigation';

export default function HomePage() {
    // Redirect /home to /dashboard
    redirect('/dashboard');
}
