"use client";
import { useEffect } from 'react';

export default function LocationProvider() {
  useEffect(() => {
    async function determineLocation() {
      // Check if location is already set in cookies to avoid repetitive calls
      if (document.cookie.includes('region_code=')) {
        return;
      }

      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data?.country_code || 'IN'; // Fallback to 'IN' natively based on user's prompt language

        document.cookie = `region_code=${countryCode}; path=/; max-age=86400`; // 1 day
      } catch (error) {
        console.error('Failed to fetch location from IP', error);
        document.cookie = 'region_code=IN; path=/; max-age=86400';
      }
    }

    determineLocation();
  }, []);

  return null;
}
