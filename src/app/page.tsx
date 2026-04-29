"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchFromAPI, resetApiKeys } from '../services/youtube';
import VideoCard from '../components/VideoCard';
import DummyAd from '../components/DummyAd';
import QuotaExceededComponent from '../components/QuotaExceeded';
import ShortCard from '../components/ShortCard';
import { Compass } from 'lucide-react';

import { enrichVideos } from '../lib/youtubeUtils';

const categories = [
  "All", "Music", "Mixes", "Gaming", "Live", "Programming", "Podcast", "News", "Esports", "Recently uploaded"
];

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [liveVideos, setLiveVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [pullRatio, setPullRatio] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchMoreVideos = useCallback(async () => {
    if (!nextPageToken || loadingMore || quotaExceeded) return;
    setLoadingMore(true);
    try {
      const query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
      const data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`);
      if (data?.error === "quota_exceeded") {
        setQuotaExceeded(true);
      } else {
        const enrichedNewVideos = await enrichVideos(data.items || [], fetchFromAPI);
        
        setVideos(prev => {
          const prevIds = new Set(prev.map(v => v.id?.videoId || v.id));
          const newVideos = enrichedNewVideos.filter((v: any) => !prevIds.has(v.id?.videoId || v.id));
          return [...prev, ...newVideos];
        });
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore, selectedCategory, quotaExceeded]);

  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPageToken) {
        fetchMoreVideos();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, nextPageToken, fetchMoreVideos]);

  const fetchVideos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setError(null);
    setNextPageToken(null);
    setQuotaExceeded(false);
    try {
      let query = selectedCategory === 'All' ? 'trending videos' : `${selectedCategory} videos`;
      if (isRefresh && selectedCategory === 'All') {
        const mix = ['viral shorts trending', 'most popular', 'latest gaming tech', 'top music videos', 'trending news worldwide'];
        query = mix[Math.floor(Math.random() * mix.length)];
      }

      let data: any = null;
      let liveDataResult: any = null;

      if (selectedCategory === 'All' && !isRefresh) {
        const [liveRes, searchRes] = await Promise.all([
          fetchFromAPI('search?part=snippet&maxResults=8&eventType=live&type=video&q=live'),
          fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video`)
        ]);
        liveDataResult = liveRes;
        data = searchRes;
      } else {
        data = await fetchFromAPI(`search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video`);
      }

      if (data?.error === "quota_exceeded" || liveDataResult?.error === "quota_exceeded") {
        setQuotaExceeded(true);
      } else {
        if (liveDataResult && liveDataResult.items) {
           const enrichedLive = await enrichVideos(liveDataResult.items, fetchFromAPI);
           setLiveVideos(enrichedLive);
        } else if (selectedCategory !== 'All' && !isRefresh) {
           setLiveVideos([]);
        }

        const enrichedItems = await enrichVideos(data.items || [], fetchFromAPI);

        if (isRefresh) {
            setVideos(prev => {
                const existingIds = new Set();
                const combined = [...enrichedItems, ...prev].filter((v: any) => {
                    const id = v.id?.videoId || v.id;
                    if (existingIds.has(id)) return false;
                    existingIds.add(id);
                    return true;
                });
                return combined;
            });
        } else {
            setVideos(enrichedItems);
        }
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('quota')) {
        setError('YouTube API Quota Exceeded. Please try again later or verify your billing/quota in Google Cloud Console.');
      } else if (err?.message?.toLowerCase().includes('invalid argument')) {
        setError('Invalid API request argument or API key. Please check your configuration.');
      } else {
        setError(err.message || 'Failed to load videos. Make sure your API key is correctly set.');
      }
    } finally {
      if (!isRefresh) setLoading(false);
      else {
        setRefreshing(false);
        setPullRatio(0);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
      if (e.cancelable) e.preventDefault();
      setPullRatio(Math.min(diff / 100, 1));
    }
  };

  const handleTouchEnd = () => {
    if (pullRatio > 0.8 && !refreshing) {
      fetchVideos(true);
    } else {
      setPullRatio(0);
    }
    setStartY(0);
  };

  return (
    <div 
      className="flex-1 overflow-y-auto px-0 sm:px-6 custom-scrollbar bg-[#0f0f0f] relative"
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh visual */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden transition-all duration-200 z-10"
        style={{ height: `${pullRatio * 60}px`, opacity: pullRatio }}
      >
        <div className={`w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center shadow-lg ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullRatio * 360}deg)` }}>
          <div className="w-5 h-5 border-2 border-white border-t-transparent flex rounded-full" />
        </div>
      </div>
      {/* Category Pills */}
      <div className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur py-3 flex gap-3 overflow-x-auto custom-scrollbar border-b border-transparent px-3 sm:px-0">
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
        {quotaExceeded ? (
          <QuotaExceededComponent onRetry={async () => {
             await resetApiKeys();
             fetchVideos();
          }} />
        ) : error ? (
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
        ) : null}
        
        {!quotaExceeded && !error && (
          loading ? (
            <div className="flex flex-col gap-0 sm:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 sm:gap-x-4 sm:gap-y-10 w-full mb-2 sm:mb-0">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse mb-4 sm:mb-0">
                    <div className="bg-[#272727] aspect-video rounded-none sm:rounded-xl mb-3"></div>
                    <div className="flex gap-3 px-3 sm:px-0">
                      <div className="w-9 h-9 bg-[#272727] rounded-full shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#272727] rounded w-[90%]"></div>
                        <div className="h-4 bg-[#272727] rounded w-[60%]"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0 sm:gap-6">
              {(() => {
                const elements: React.ReactNode[] = [];
                let vIndex = 0;
                let cycle = 0;

                const pushAd = (idx: number) => {
                  elements.push(
                    <div key={`ad-${idx}`} className="w-full px-0 sm:px-0 mb-2 sm:mb-6">
                      <DummyAd layout="grid" />
                    </div>
                  );
                };

                const pushVideos = (count: number, cycleIdx: number) => {
                  const countToPush = Math.min(count, videos.length - vIndex);
                  if (countToPush <= 0) return;
                  const chunk = videos.slice(vIndex, vIndex + countToPush);
                  
                  elements.push(
                    <div key={`vchunk-${cycleIdx}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 sm:gap-x-4 sm:gap-y-10 w-full mb-2 sm:mb-0">
                      {chunk.map((video, i) => {
                        vIndex++;
                        const isLastInArray = vIndex === videos.length;
                        return (
                          <div key={video.id?.videoId || video.id || `v-${vIndex}`} ref={isLastInArray ? lastVideoElementRef : undefined}>
                            <VideoCard video={video} layout="grid" />
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                const pushShorts = (count: number, cycleIdx: number) => {
                  const countToPush = Math.min(count, videos.length - vIndex);
                  if (countToPush <= 0) return;
                  const chunk = videos.slice(vIndex, vIndex + countToPush);
                  
                  elements.push(
                    <div key={`schunk-${cycleIdx}`} className="mb-4 sm:mb-8 clear-both w-full border-b border-[#272727] pb-8 pt-4 sm:border-none sm:pb-0 sm:pt-0">
                      <div className="flex items-center gap-2 px-3 sm:px-0 mb-4 mt-2 sm:mt-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Youtube_shorts_icon.svg/512px-Youtube_shorts_icon.svg.png" alt="Shorts" className="w-6 h-6 object-contain" />
                        <h2 className="text-xl font-bold text-white">Shorts</h2>
                      </div>
                      <div className="flex overflow-x-auto custom-scrollbar gap-2 sm:gap-4 px-2 sm:px-0 pb-4 snap-x">
                        {chunk.map((video, i) => {
                           vIndex++;
                           const isLastInArray = vIndex === videos.length;
                           return (
                             <div key={video.id?.videoId || video.id || `s-${vIndex}`} className="min-w-[140px] w-[140px] sm:min-w-[180px] sm:w-[180px] snap-start shrink-0" ref={isLastInArray ? lastVideoElementRef : undefined}>
                               <ShortCard video={video} />
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  );
                };

                const pushLive = () => {
                  if (liveVideos.length === 0) return;
                  elements.push(
                    <div key={`live-section`} className="mb-4 sm:mb-8 clear-both w-full border-b border-[#272727] pb-8 sm:border-none sm:pb-0">
                      <div className="flex items-center justify-between px-3 sm:px-0 mb-4 mt-2 sm:mt-0">
                        <div className="flex items-center gap-2">
                           <div className="bg-red-600 rounded-full w-2 h-2 animate-pulse" />
                           <h2 className="text-xl font-bold text-white">Live</h2>
                        </div>
                      </div>
                      <div className="flex overflow-x-auto custom-scrollbar gap-2 sm:gap-4 px-2 sm:px-0 pb-4 snap-x">
                        {liveVideos.map((video, i) => (
                           <div key={video.id?.videoId || video.id || `live-${i}`} className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] snap-start shrink-0">
                             <VideoCard video={video} layout="carousel" />
                           </div>
                        ))}
                      </div>
                    </div>
                  );
                };

                while (vIndex < videos.length) {
                  if (cycle === 0) {
                    pushLive();
                    pushVideos(4, cycle);
                    if (vIndex < videos.length) pushShorts(6, cycle);
                    if (vIndex < videos.length) pushAd(cycle);
                  } else if (cycle % 2 === 1) {
                    pushVideos(4, cycle);
                    if (vIndex < videos.length) pushAd(cycle);
                  } else {
                    pushShorts(6, cycle);
                    if (vIndex < videos.length) pushAd(cycle);
                  }
                  cycle++;
                }

                return elements;
              })()}
            </div>
          )
        )}
        
        {loadingMore && !quotaExceeded && !error && (
          <div className="w-full flex justify-center py-6 mt-4">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
