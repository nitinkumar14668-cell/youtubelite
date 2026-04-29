const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Mock generation omitted for brevity, but I will keep it for safety.
const generateMockData = (url: string) => {
  if (url.includes('videos?')) {
    return {
      items: [{
        id: "mock_vid_detail",
        snippet: {
          title: "Mock Video - API Quota Exceeded",
          description: "This is a mock description because all YouTube API quotas were exceeded. Normal service will resume when quotas reset.",
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
              textDisplay: "This is a mock comment.",
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
        title: `Mock Video Title ${i + 1}`,
        description: 'All YouTube API quotas exceeded. Dummy data shown.',
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
  
  try {
    const response = await fetch(`/api/youtube?endpoint=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        return generateMockData(url);
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch from YouTube API');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching from custom API proxy, falling back to mock data:", error);
    return generateMockData(url);
  }
};
