'use server';

import { keyManager, fetchWithCache } from '../lib/apiManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchFromAPI = async (url: string) => {
  const fetcher = async () => {
    let attempts = 0;
    const maxAttempts = keyManager.getTotalKeys();
    
    while (attempts < maxAttempts) {
      const currentKey = keyManager.getCurrentKey();
      if (!currentKey) {
         throw new Error("quotaExceeded");
      }

      const separator = url.includes('?') ? '&' : '?';
      const targetUrl = `${BASE_URL}/${url}${separator}key=${currentKey}`;
      
      try {
        const response = await fetch(targetUrl, { cache: 'no-store' });
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (e) {
            // Ignore parse errors
          }

          const isQuotaError = response.status === 403 || response.status === 429 || errorData?.error?.errors?.[0]?.reason === 'quotaExceeded';

          if (isQuotaError) {
             keyManager.markCurrentKeyAsFailed();
             attempts++;
             continue;
          }

          const reason = errorData?.error?.errors?.[0]?.reason || response.statusText || 'Unknown';
          const message = errorData?.error?.message || `HTTP ${response.status}`;
          throw new Error(`YouTube API Error [${reason}]: ${message}`);
        }
        
        return await response.json();
      } catch (error: any) {
        if (error.message && error.message.includes('YouTube API Error')) {
           throw error;
        }
        // only log actual network errors, not quota fails.
        // since quota fails just `continue`, this catch is mostly for network errors
        attempts++;
      }
    }
    
    throw new Error("quotaExceeded");
  };

  try {
    let ttlMs = 15 * 60 * 1000;
    if (url.startsWith('videos?')) {
      ttlMs = 60 * 60 * 1000; 
    }
    
    const data = await fetchWithCache(url, fetcher, ttlMs);
    return data;
  } catch (error: any) {
    if (error.message === "quotaExceeded") {
      console.warn("YouTube API quota exceeded. Falling back to QuotaExceeded response.");
      return { error: "quota_exceeded", message: "Try again tomorrow" };
    }
    throw error;
  }
};
