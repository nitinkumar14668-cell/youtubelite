const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchFromAPI = async (url: string) => {
  if (!API_KEY) {
    throw new Error("YouTube API key is missing. Please set VITE_YOUTUBE_API_KEY.");
  }
  
  const separator = url.includes('?') ? '&' : '?';
  const requestUrl = `${BASE_URL}/${url}${separator}key=${API_KEY}`;
  
  try {
    const response = await fetch(requestUrl);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("YouTube API quota exceeded or API key is invalid.");
      }
      const errorData = await response.json();
      console.error("YouTube API Error:", errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch from YouTube API');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from API:", error);
    throw error;
  }
};
