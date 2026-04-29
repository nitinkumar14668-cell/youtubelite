'use server';

import { keyManager, fetchWithCache } from '../lib/apiManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Mock generation omitted for brevity, but I will keep it for safety.
const generateMockData = (url: string, error?: any) => {
  let errorMessage = "All YouTube API quotas were exceeded. Normal service will resume when quotas reset.";
  let errorTitle = "Mock Video - API Quota Exceeded";

  if (error instanceof Error) {
    if (error.message.includes('invalidArgument') || error.message.includes('badRequest')) {
      errorMessage = "The requested search or parameters are invalid. Please check your query.";
      errorTitle = "Mock Video - Invalid Request";
    } else if (error.message.includes('All API key attempts failed') || error.message.includes('network unreachable')) {
      errorMessage = "YouTube API keys are exhausted or the network is unreachable. Falling back to mock data.";
      errorTitle = "Mock Video - Service Unavailable";
    } else if (error.message.includes('YouTube API Error')) {
      errorMessage = `YouTube API Error: ${error.message}`;
      errorTitle = "Mock Video - API Error";
    }
  }

  if (url.includes('videos?')) {
    return {
      items: [{
        id: "mock_vid_detail",
        snippet: {
          title: errorTitle,
          description: errorMessage,
          channelTitle: "Mock Channel",
          channelId: "mock_channel_id",
          publishedAt: new Date().toISOString(),
          thumbnails: {
            medium: { url: `https://picsum.photos/seed/${Date.now()}/640/360` },
          }
        },
        statistics: {
          viewCount: "1234567",
          likeCount: "45678",
          commentCount: "890"
        }
      }]
    };
  }
  
  if (url.includes('commentThreads?')) {
    return {
      items: Array(10).fill(0).map((_, i) => ({
        id: `mock_comment_${i}`,
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: `Mock User ${i + 1}`,
              authorProfileImageUrl: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`,
              textDisplay: `This is a mock comment. ${errorMessage}`,
              likeCount: Math.floor(Math.random() * 100),
              publishedAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
            }
          }
        }
      }))
    };
  }

  return {
    items: Array(20).fill(0).map((_, i) => ({
      id: { videoId: `mock_vid_${Date.now()}_${i}` },
      snippet: {
        title: `${errorTitle} ${i + 1}`,
        description: errorMessage,
        thumbnails: {
          medium: { url: `https://picsum.photos/seed/${Date.now()}_${i}/640/360` },
        },
        channelTitle: `Mock Channel ${i + 1}`,
        channelId: "mock_channel_id",
        publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      }
    })),
    nextPageToken: `mock_page_token_${Date.now()}`
  };
};

export const fetchFromAPI = async (url: string) => {
  if (url.includes('mock_vid_')) {
    return generateMockData(url);
  }
  
  const fetcher = async () => {
    let attempts = 0;
    const maxAttempts = keyManager.getTotalKeys();
    
    while (attempts < maxAttempts) {
      const currentKey = keyManager.getCurrentKey();
      if (!currentKey) {
         throw new Error("All YouTube API keys exhausted.");
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
    
    throw new Error("All API key attempts failed or network is unreachable.");
  };

  try {
    let ttlMs = 15 * 60 * 1000;
    if (url.startsWith('videos?')) {
      ttlMs = 60 * 60 * 1000; 
    }
    
    const data = await fetchWithCache(url, fetcher, ttlMs);
    return data;
  } catch (error: any) {
    console.warn(`YouTube API fallback triggered. Reason: ${error.message || 'Unknown error'}`);
    return generateMockData(url, error);
  }
};
