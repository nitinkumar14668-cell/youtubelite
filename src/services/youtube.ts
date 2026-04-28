const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const generateMockData = (url: string) => {
  if (url.includes('videos?')) {
    return {
      items: [{
        id: "mock_vid_detail",
        snippet: {
          title: "Mock Video - API Quota Exceeded",
          description: "This is a mock description because the YouTube API quota was exceeded or the API key is missing. Normal service will resume when the quota resets or a valid key is provided.",
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
              textDisplay: "This is a mock comment because the API quota was exceeded.",
              likeCount: Math.floor(Math.random() * 100),
              publishedAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
            }
          }
        }
      }))
    };
  }

  // search or related endpoint fallback
  return {
    items: Array(20).fill(0).map((_, i) => ({
      id: { videoId: `mock_vid_${Date.now()}_${i}` },
      snippet: {
        title: `Mock Video Title ${i + 1}`,
        description: 'This is a mock video description. The YouTube API quota was exceeded, so dummy data is shown instead.',
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
  if (!API_KEY) {
    console.warn("YouTube API key is missing. Returning mock data.");
    return generateMockData(url);
  }
  
  const separator = url.includes('?') ? '&' : '?';
  const requestUrl = `${BASE_URL}/${url}${separator}key=${API_KEY}`;
  
  try {
    const response = await fetch(requestUrl);
    
    if (!response.ok) {
      if (response.status === 403) {
        console.warn("YouTube API quota exceeded or API key is invalid. Returning mock data.");
        return generateMockData(url);
      }
      const errorData = await response.json();
      console.error("YouTube API Error:", errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch from YouTube API');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from API:", error);
    // If the error is network related or fetch failed entirely, we optionally fallback to mock data too
    if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn("Network error encountered. Returning mock data.");
        return generateMockData(url);
    }
    throw error;
  }
};
