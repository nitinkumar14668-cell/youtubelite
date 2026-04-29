"use client";
import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../../services/youtube';
import VideoCard from '../../components/VideoCard';
import { LayoutList } from 'lucide-react';
import QuotaExceededComponent from '../../components/QuotaExceeded';

const MOCK_SUBSCRIPTIONS = [
  "MrBeast",
  "PewDiePie",
  "Marques Brownlee",
  "Linus Tech Tips",
  "Veritasium"
];

export default function SubscriptionsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        // We'll just fetch a few of the latest videos by simulating a search for them
        const data = await fetchFromAPI(`search?part=snippet&maxResults=25&q=${encodeURIComponent('latest tech gaming vlog')}&order=date&type=video`);
        if (data?.error === "quota_exceeded") {
          setQuotaExceeded(true);
        } else {
             setVideos(data.items || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 custom-scrollbar bg-[#0f0f0f]">
      {/* Top Banner / Channel List */}
      <div className="flex gap-4 overflow-x-auto py-6 custom-scrollbar mb-4 border-b border-[#272727]">
        {MOCK_SUBSCRIPTIONS.map((channel, i) => (
          <div key={i} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg ${i === 0 ? 'ring-2 ring-blue-500 p-0.5' : ''}`}>
              {channel[0]}
            </div>
            <span className="text-xs text-gray-300 w-16 text-center truncate">{channel}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 justify-center ml-2 text-blue-400">
           <span className="text-sm font-medium">All</span>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-white">Latest from your subscriptions</h2>

      {quotaExceeded ? (
        <QuotaExceededComponent onRetry={() => window.location.reload()} />
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : loading ? (
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
  );
}
