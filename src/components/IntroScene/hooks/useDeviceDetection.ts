import { useState, useEffect } from 'react';

interface DeviceInfo {
  isDesktop: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  hasReducedMotion: boolean;
}

const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Initial state based on current window size
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    const isDesktop = width >= 1024; // Desktop threshold as per requirements
    
    // Check for reduced motion preference
    const hasReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

    return {
      isDesktop,
      isMobile: !isDesktop,
      screenWidth: width,
      screenHeight: height,
      hasReducedMotion,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isDesktop = width >= 1024;

      setDeviceInfo(prev => ({
        ...prev,
        isDesktop,
        isMobile: !isDesktop,
        screenWidth: width,
        screenHeight: height,
      }));
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setDeviceInfo(prev => ({
        ...prev,
        hasReducedMotion: e.matches,
      }));
    };

    // Set up event listeners
    window.addEventListener('resize', handleResize);
    
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', handleMotionChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      motionMediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;