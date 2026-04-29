'use server';

import { keyManager, fetchWithCache } from '../lib/apiManager';
import ytSearch from 'yt-search';

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
      console.warn("YouTube API quota exceeded. Falling back to internal yt-search...");
      
      const [path, qs] = url.split('?');
      const params = new URLSearchParams(qs || '');
      
      try {
        
        if (path === 'search') {
          const q = params.get('q') || 'trending';
          const channelId = params.get('channelId');
          
          let r;
          if (channelId) {
             r = await ytSearch(channelId + ' videos');
          } else {
             r = await ytSearch(q);
          }
          
          return {
            items: (r.videos || []).slice(0, 20).map(v => ({
              id: { videoId: v.videoId || '' },
              snippet: {
                title: v.title || 'Unknown Video',
                description: v.description || '',
                thumbnails: {
                  medium: { url: v.thumbnail || v.image || '' },
                  high: { url: v.image || v.thumbnail || '' },
                },
                channelTitle: v.author?.name || 'Unknown',
                channelId: v.author?.url?.split('/').pop() || 'channel',
                publishedAt: v.uploadDate ? new Date(v.uploadDate).toISOString() : new Date().toISOString(),
              }
            }))
          };
        } else if (path === 'videos') {
          const id = params.get('id');
          if (!id) return { items: [] };
          try {
            const v = await ytSearch({ videoId: id });
            if (!v) return { items: [] };
            
            return {
              items: [{
                id: v.videoId,
                snippet: {
                  title: v.title,
                  description: v.description,
                  thumbnails: { medium: { url: v.thumbnail || v.image }, high: { url: v.thumbnail || v.image } },
                  channelTitle: v.author?.name || 'Unknown',
                  publishedAt: v.uploadDate ? new Date(v.uploadDate).toISOString() : new Date().toISOString(),
                },
                statistics: {
                  viewCount: v.views ? v.views.toString() : '0',
                  likeCount: '0'
                }
              }]
            };
          } catch (err) {
             console.error("ytSearch video fetching error", err);
             return { items: [] };
          }
        } else if (path === 'channels') {
           return {
             items: [{
               id: params.get('id'),
               snippet: {
                 title: 'YouTube Channel',
                 description: 'Information limited in fallback mode.',
                 thumbnails: { default: { url: '' }, high: { url: '' } }
               },
               statistics: { subscriberCount: '0', videoCount: '0' },
               brandingSettings: { image: { bannerExternalUrl: '' } }
             }]
           };
        } else if (path === 'commentThreads') {
           return { items: [] };
        }
        
        return { items: [] };
      } catch (e) {
         console.error("Fallback error:", e);
      }
      return { error: "quota_exceeded", message: "Try again tomorrow" };
    }
    throw error;
  }
};
