'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, Users, Grid3x3, FileText, MessageSquare, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DoctorPostsGrid } from '@/components/social/doctor-posts-grid';
import { QuickBookModal } from '@/components/booking/quick-book-modal';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [showBookingModal, setShowBookingModal] = useState(false);

  // Mock doctor data - replace with API call
  const doctor = {
    id: doctorId,
    name: 'John Smith',
    specialty: 'Cardiologist',
    image: '',
    consultation_fee: 500,
    rating: 4.8,
    review_count: 450,
    experience_years: 15,
    qualifications: ['MBBS', 'MD (Cardiology)', 'DM (Cardiology)'],
    languages: ['English', 'Hindi'],
    location: 'Mumbai, Maharashtra',
    about: 'Dr. John Smith is a highly experienced cardiologist with over 15 years of practice. Specializes in interventional cardiology and heart failure management.',
    post_count: 35,
    follower_count: 1200,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg">Doctor Profile</h1>
        </div>
      </div>

      {/* Doctor Info Card */}
      <div className="bg-white border-b p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
            <AvatarImage src={doctor.image} alt={doctor.name} />
            <AvatarFallback className="bg-medical-blue text-white text-2xl font-bold">
              {doctor.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900">Dr. {doctor.name}</h2>
            <p className="text-gray-600">{doctor.specialty}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{doctor.rating}</span>
              <span className="text-sm text-gray-500">({doctor.review_count} reviews)</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{doctor.location}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="font-bold text-lg text-gray-900">{doctor.post_count}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-900">{doctor.follower_count}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-900">{doctor.experience_years}+</p>
            <p className="text-xs text-gray-500">Years Exp</p>
          </div>
        </div>
      </div>

      {/* Sticky Booking Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="font-bold text-2xl text-medical-blue">₹{doctor.consultation_fee}</p>
            <p className="text-xs text-gray-500">Next available: Today 3:00 PM</p>
          </div>
          <Button
            onClick={() => setShowBookingModal(true)}
            className="bg-medical-blue hover:bg-blue-700 text-white px-6 py-3 rounded-xl h-auto font-semibold shadow-lg"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="bg-white">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="about"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:bg-transparent px-6 py-3"
          >
            <FileText className="h-4 w-4 mr-2" />
            About
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:bg-transparent px-6 py-3"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:bg-transparent px-6 py-3"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{doctor.about}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Qualifications</h3>
            <div className="space-y-2">
              {doctor.qualifications.map((qual, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-medical-blue" />
                  <span>{qual}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
            <div className="flex gap-2">
              {doctor.languages.map((lang, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
            <p className="text-sm text-gray-600">{doctor.experience_years}+ years in {doctor.specialty}</p>
          </div>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="p-0">
          <DoctorPostsGrid doctorId={doctorId} />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="p-4">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Reviews coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Book Modal */}
      <QuickBookModal
        doctor={doctor}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        source="profile"
      />
    </div>
  );
}