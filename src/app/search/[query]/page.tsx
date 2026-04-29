"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { fetchFromAPI, resetApiKeys } from '../../../services/youtube';
import { enrichVideos } from '../../../lib/youtubeUtils';
import VideoCard from '../../../components/VideoCard';
import DummyAd from '../../../components/DummyAd';
import QuotaExceededComponent from '../../../components/QuotaExceeded';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';

const SEARCH_FILTERS = ['All', 'Shorts', 'Unwatched', 'Watched'];

export default function Search() {
  const params = useParams();
  const query = decodeURIComponent(params?.query as string || '');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  
  // Pull to refresh state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [pullRatio, setPullRatio] = useState(0);

  const fetchResults = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setQuotaExceeded(false);
    
    try {
      const type = activeFilter === 'Shorts' ? 'video' : 'video'; // API limitation, fake it
      const searchQuery = activeFilter === 'Shorts' ? `${query} #shorts` : query;
      const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(searchQuery)}&type=${type}`);
      if (data?.error === "quota_exceeded") {
        setQuotaExceeded(true);
      } else {
        const enrichedItems = await enrichVideos(data.items || [], fetchFromAPI);
        setVideos(enrichedItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isRefresh) setLoading(false);
      else {
        setRefreshing(false);
        setPullRatio(0);
      }
    }
  }, [query, activeFilter]);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, fetchResults]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;
    if (diff > 0 && scrollRef.current?.scrollTop === 0) {
      // Prevent overscroll native behavior on mobile
      if (e.cancelable) e.preventDefault();
      setPullRatio(Math.min(diff / 100, 1));
    }
  };

  const handleTouchEnd = () => {
    if (pullRatio > 0.8 && !refreshing) {
      fetchResults(true);
    } else {
      setPullRatio(0);
    }
    setStartY(0);
  };

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-2 sm:py-6 custom-scrollbar bg-[#0f0f0f] relative"
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh visual */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: `${pullRatio * 60}px`, opacity: pullRatio }}
      >
        <Loader2 className={`w-6 h-6 text-white ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullRatio * 360}deg)` }} />
      </div>

      <div className="max-w-[1096px] mx-auto">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar-on-mobile pb-2 sticky top-0 bg-[#0f0f0f] z-10 sm:static sm:pb-0 pt-2 sm:pt-0">
          <button className="hidden sm:flex items-center gap-2 hover:bg-[#272727] py-1.5 px-3 rounded-full transition-colors text-sm font-medium mr-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          
          <div className="flex items-center gap-3 w-full sm:hidden shrink-0 mb-1">
             <SlidersHorizontal className="w-5 h-5 ml-1" />
             {SEARCH_FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border max-h-8 flex items-center justify-center shrink-0 ${
                  activeFilter === filter 
                  ? 'bg-white text-black border-transparent' 
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f] border-[#3f3f3f]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="w-full flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quotaExceeded ? (
          <QuotaExceededComponent onRetry={async () => {
             await resetApiKeys();
             fetchResults();
          }} />
        ) : (
          <div className="flex flex-col sm:gap-4 pb-20">
            {videos.map((video, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && idx % 4 === 2 && (
                  <DummyAd layout="search" />
                )}
                <VideoCard video={video} layout="search" />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
