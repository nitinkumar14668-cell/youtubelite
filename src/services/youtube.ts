'use server';

import { keyManager, fetchWithCache } from '../lib/apiManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const resetApiKeys = async () => {
  keyManager.reset();
};

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

          const reason = errorData?.error?.errors?.[0]?.reason || 'Unknown';
          const message = errorData?.error?.message || `HTTP ${response.status}`;
          
          const isQuotaError = response.status === 429 || reason === 'quotaExceeded' || reason === 'rateLimitExceeded' || reason === 'dailyLimitExceeded';

          if (reason === 'accessNotConfigured' || reason === 'keyInvalid' || reason === 'youtubeSignupRequired') {
            if (currentKey === process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
               throw new Error(`YouTube API Error [${reason}]: ${message}. Please ensure the YouTube Data API v3 is enabled for your key.`);
            }
          }

          // For the user's keys (assuming they might be at index 0 or 1), if it's a configuration error, we should log it prominently.
          if (response.status === 403 || response.status === 400 || isQuotaError) {
            if (!isQuotaError) {
               if (currentKey === process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || currentKey === process.env.YOUTUBE_API_KEY) {
                  console.warn(`[YouTube API Error] Key ${currentKey.substring(0, 5)}... failed with ${reason}: ${message}`);
               }
            }
            // To ensure we don't block on invalid keys but try other keys, we still treat these as 'failed keys' and skip
            keyManager.markCurrentKeyAsFailed();
            attempts++;
            continue;
          }

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
      // Instead of returning an error, fallback to our internal yt-search proxy backend!
      console.warn("YouTube API quota exceeded. Falling back to yt-search proxy...");
      const [path, qs] = url.split('?');
      try {
         const fallbackRes = await fetch(`/api/youtube?path=${encodeURIComponent(path)}&qs=${encodeURIComponent(qs || '')}`);
         if (fallbackRes.ok) {
            return await fallbackRes.json();
         }
      } catch (e) {
         console.error("Fallback error:", e);
      }
      return { error: "quota_exceeded", message: "Try again tomorrow" };
    }
    throw error;
  }
};
