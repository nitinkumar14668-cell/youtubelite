"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchFromAPI } from '../../../services/youtube';
import VideoCard from '../../../components/VideoCard';
import { SlidersHorizontal } from 'lucide-react';

export default function Search() {
  const params = useParams();
  const query = params?.query as string;
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video`);
        setVideos(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar bg-[#0f0f0f]">
      <div className="max-w-[1096px] mx-auto">
        <button className="flex items-center gap-2 mb-6 hover:bg-[#272727] py-1.5 px-3 rounded-full transition-colors text-sm font-medium ml-auto">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        
        {loading ? (
          <div className="w-full flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {videos.map((video, idx) => (
              <VideoCard key={idx} video={video} layout="row" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
