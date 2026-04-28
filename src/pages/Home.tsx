import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchFromAPI } from '../services/youtube';
import VideoCard from '../components/VideoCard';
import { Compass } from 'lucide-react';

const categories = [
  "All", "Music", "Mixes", "Gaming", "Live", "Programming", "Podcast", "News", "Esports", "Recently uploaded"
];

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPageToken) {
        fetchMoreVideos();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, nextPageToken]);

  const fetchMoreVideos = async () => {
    setLoadingMore(true);
    try {
      const query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
      const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${query}&type=video&pageToken=${nextPageToken}`);
      setVideos(prev => [...prev, ...(data.items || [])]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      setNextPageToken(null);
      try {
        const query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
        const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${query}&type=video`);
        setVideos(data.items || []);
        setNextPageToken(data.nextPageToken || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load videos. Make sure your API key is correctly set in .env');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 custom-scrollbar bg-[#0f0f0f]">
      {/* Category Pills */}
      <div className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur py-3 flex gap-3 overflow-x-auto custom-scrollbar border-b border-transparent">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat 
                ? 'bg-white text-black' 
                : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="py-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-4">
            <Compass className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Configuration Needed</h3>
              <p className="text-sm">{error}</p>
              <div className="mt-2 text-xs text-red-300">
                Create a YouTube Data API v3 key at <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline hover:text-white">Google Cloud Console</a> and add it to your environment variables as VITE_YOUTUBE_API_KEY.
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-4 sm:gap-y-10">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#272727] aspect-video rounded-xl mb-3"></div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-[#272727] rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#272727] rounded w-[90%]"></div>
                    <div className="h-4 bg-[#272727] rounded w-[60%]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-4 sm:gap-y-10">
            {videos.map((video, idx) => {
              if (videos.length === idx + 1) {
                return (
                  <div ref={lastVideoElementRef} key={idx}>
                    <VideoCard video={video} />
                  </div>
                );
              } else {
                return <VideoCard key={idx} video={video} />;
              }
            })}
          </div>
        )}
        
        {loadingMore && (
          <div className="w-full flex justify-center py-6 mt-4">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
