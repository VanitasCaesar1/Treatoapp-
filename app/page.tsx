import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video, FileText, Users, Pill, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-8 py-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
        <div className="max-w-4xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Health, <span className="text-blue-600">Simplified</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Access quality healthcare from anywhere. Book appointments, consult with doctors online, and manage your medical records all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Better Healthcare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools you need to manage your health effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Easy Appointment Booking</CardTitle>
              <CardDescription>
                Schedule appointments with top doctors at your convenience. View availability and book instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Video className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Video Consultations</CardTitle>
              <CardDescription>
                Connect with healthcare providers through secure video calls from the comfort of your home.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                Access your complete medical history, prescriptions, and vital signs all in one secure location.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Find Specialists</CardTitle>
              <CardDescription>
                Search and connect with qualified doctors across various specialties and locations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Pill className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Medicine Information</CardTitle>
              <CardDescription>
                Search for medicines and get detailed information about prescriptions and dosages.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ClipboardList className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Health Community</CardTitle>
              <CardDescription>
                Share experiences and connect with others on their healthcare journey in a supportive community.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100">
            Join thousands of patients who trust our platform for their healthcare needs
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="mt-4">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Patient Health App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
