import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../services/youtube';
import VideoCard from '../components/VideoCard';
import { Compass } from 'lucide-react';

const categories = [
  "All", "Music", "Mixes", "Gaming", "Live", "Programming", "Podcast", "News", "Esports", "Recently uploaded"
];

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
        const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${query}&type=video`);
        // Searching doesn't give us views/likes directly, we'd need another query to 'videos' endpoint,
        // but for a lite version, we fallback to random in VideoCard or fetch them if needed.
        setVideos(data.items || []);
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
            {videos.map((video, idx) => (
              <VideoCard key={idx} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
