import { Button } from '@/components/ui/button';
import Slideshow from '@/components/ui/slideshow';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import React from 'react';

const slides = [
  {
    title: 'Welcome to buildr',
    description: 'Your ultimate platform to transform your space into your dream home.',
  },
  {
    title: 'Scan or Create Your Room',
    description: 'Use your camera to scan your room or start from scratch with our easy tools.',
  },
  {
    title: 'Design It Yourself',
    description: 'Customize every detail with our intuitive design interface.',
  },
  {
    title: 'Let AI Design It',
    description:
      'Harness the power of AI to generate stunning designs tailored to your preferences.',
  },
  {
    title: 'Hire a Professional',
    description: 'Connect with expert designers to bring your vision to life.',
  },
  {
    title: 'Find the Best Offers',
    description: 'Discover top deals on furniture and connect with reliable workers and companies.',
  },
];

function AboutScreen() {
  return (
    <Slideshow
      slides={slides}
      autoSlideInterval={2000}
      lastSlideButton={
        <Link href="/" asChild>
          <Button>
            <Text>Get Started</Text>
          </Button>
        </Link>
      }
    />
  );
}

export default AboutScreen;
