"use client";
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
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
      const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`);
      setVideos(prev => [...prev, ...(data.items || [])]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNextPageToken(null);
    try {
      const query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
      const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video`);
      setVideos(data.items || []);
      setNextPageToken(data.nextPageToken || null);
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('quota')) {
        setError('YouTube API Quota Exceeded. Please try again later or verify your billing/quota in Google Cloud Console.');
      } else if (err?.message?.toLowerCase().includes('invalid argument')) {
        setError('Invalid API request argument or API key. Please check your configuration.');
      } else {
        setError(err.message || 'Failed to load videos. Make sure your API key is correctly set.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 sm:p-8 rounded-2xl max-w-lg w-full flex flex-col items-center gap-4">
              <Compass className="w-12 h-12 shrink-0 text-red-500/80" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">Oops! Something went wrong</h3>
                <p className="text-sm mb-4 leading-relaxed text-red-200">{error}</p>
                <div className="text-xs text-stone-400 mb-6 bg-black/40 p-3 rounded-lg border border-white/5">
                  Check your YouTube Data API v3 key at <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">Google Cloud Console</a>. Ensure the key is valid and added to your environment variables as <code>NEXT_PUBLIC_YOUTUBE_API_KEY</code>.
                </div>
                <button 
                  onClick={() => fetchVideos()}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-medium rounded-full transition-all flex items-center justify-center w-full sm:w-auto mx-auto"
                >
                  Retry Fetch
                </button>
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
