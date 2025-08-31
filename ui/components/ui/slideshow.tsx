import { Text } from '@/components/ui/text';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
}

interface SlideshowProps {
  slides: Slide[];
  autoSlideInterval?: number;
  lastSlideButton?: ReactNode;
  showIndicators?: boolean;
}

function Slideshow({
  slides,
  autoSlideInterval = 5000,
  lastSlideButton,
  showIndicators = true,
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (!isAutoSliding || prev === slides.length - 1) return prev;
        const next = prev + 1;
        scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [isAutoSliding, autoSlideInterval, slides.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
    if (slideIndex < slides.length - 1) {
      setIsAutoSliding(true);
    }
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        className="flex-1">
        {slides.map((slide, index) => (
          <View key={index} style={{ width }} className="flex-1 items-center justify-center p-8">
            <Text variant="h1" className="mb-4 text-center text-2xl font-bold">
              {slide.title}
            </Text>
            <Text className="mb-8 text-center text-lg text-muted-foreground">
              {slide.description}
            </Text>
            {index === slides.length - 1 && lastSlideButton}
          </View>
        ))}
      </ScrollView>
      {showIndicators && (
        <View className="flex-row justify-center pb-4">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </View>
      )}
    </>
  );
}

export default Slideshow;
