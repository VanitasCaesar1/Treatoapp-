'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Video, FileText, Shield } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const onboardingSlides = [
  {
    icon: Calendar,
    title: 'Book Appointments',
    description: 'Schedule appointments with top doctors at your convenience. View availability and book instantly.',
    color: 'bg-blue-500',
  },
  {
    icon: Video,
    title: 'Video Consultations',
    description: 'Connect with healthcare providers through secure video calls from anywhere.',
    color: 'bg-green-500',
  },
  {
    icon: FileText,
    title: 'Medical Records',
    description: 'Access your complete medical history, prescriptions, and vital signs all in one place.',
    color: 'bg-purple-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health data is encrypted and protected with industry-leading security standards.',
    color: 'bg-orange-500',
  },
];

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has completed onboarding
      const { value } = await Preferences.get({ key: 'onboarding_completed' });

      if (value === 'true') {
        // Skip onboarding, go to dashboard
        router.replace('/dashboard');
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsChecking(false);
    }
  };

  const markOnboardingComplete = async () => {
    try {
      await Preferences.set({
        key: 'onboarding_completed',
        value: 'true',
      });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const slide = onboardingSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-6">
        <button
          onClick={async () => {
            await markOnboardingComplete();
            router.push('/dashboard');
          }}
          className="text-sm text-gray-500 font-medium"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div className={`w-32 h-32 rounded-full ${slide.color} flex items-center justify-center mb-8 shadow-2xl`}>
          <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          {slide.title}
        </h1>
        <p className="text-base text-gray-600 text-center leading-relaxed max-w-sm">
          {slide.description}
        </p>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {onboardingSlides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${index === currentSlide
              ? 'w-8 bg-gray-900'
              : 'w-2 bg-gray-300'
              }`}
          />
        ))}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        {isLastSlide ? (
          <button
            onClick={async () => {
              await markOnboardingComplete();
              router.push('/dashboard');
            }}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
