"use client";
import React, { useEffect, useState, useRef } from 'react';
import { fetchFromAPI } from '../../services/youtube';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import QuotaExceededComponent from '../../components/QuotaExceeded';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function ShortsPage() {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadShorts() {
      try {
        setLoading(true);
        // We use query "#shorts" to fetch short-form content
        const data = await fetchFromAPI(`search?part=snippet&maxResults=10&q=${encodeURIComponent('#shorts funny tiktok')}&type=video`);
        if (data?.error === "quota_exceeded") {
          setQuotaExceeded(true);
        } else {
          setShorts(data.items || []);
          setNextPageToken(data.nextPageToken || null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load shorts");
      } finally {
        setLoading(false);
      }
    }
    loadShorts();
  }, []);

  if (quotaExceeded) {
    return <div className="p-4 flex-1 flex items-center justify-center"><QuotaExceededComponent onRetry={() => window.location.reload()} /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10 flex-1">{error}</div>;
  }

  if (loading) {
    return <div className="flex-1 bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex-1 bg-[#0f0f0f] sm:bg-black overflow-y-auto snap-y snap-mandatory custom-scrollbar relative h-[calc(100vh-64px)] sm:h-auto">
      {shorts.map((short, idx) => (
        <ShortsPlayer key={idx} short={short} />
      ))}
    </div>
  );
}

function ShortsPlayer({ short }: { short: any }) {
  const videoId = typeof short.id === 'string' ? short.id : short.id?.videoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsPlaying(entry.isIntersecting);
        });
      },
      { threshold: 0.6 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  if (!videoId) return null;

  return (
    <div 
      ref={containerRef}
      className="w-full h-[calc(100vh-50px)] sm:h-[calc(100vh-64px)] snap-start flex justify-center items-center py-0 sm:py-4 relative bg-black"
    >
      <div className="relative w-full sm:w-[400px] h-full sm:h-full sm:rounded-2xl overflow-hidden bg-[#222]">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0`}
            allow="autoplay; encrypted-media"
            className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover pointer-events-auto"
            style={{ border: 'none' }}
          />
        ) : (
          <Image 
            src={short.snippet?.thumbnails?.high?.url || short.snippet?.thumbnails?.medium?.url || 'https://via.placeholder.com/400x800.png?text=No+Thumbnail'} 
            alt="thumbnail"
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        )}

        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Info */}
        <div className="absolute bottom-4 left-4 right-16 z-10 text-white pointer-events-none">
          <div className="flex items-center gap-2 mb-3 pointer-events-auto">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-md">
              {short.snippet?.channelTitle?.[0] || 'C'}
            </div>
            <span className="font-semibold text-[15px] drop-shadow-md">@{short.snippet?.channelTitle}</span>
            <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold ml-2">Subscribe</button>
          </div>
          <p className="text-sm line-clamp-2 drop-shadow-md font-medium">{short.snippet?.title}</p>
        </div>

        {/* Side Actions */}
        <div className="absolute bottom-4 right-2 sm:right-[-60px] flex flex-col items-center gap-5 sm:gap-6 z-10 pointer-events-auto">
          <div className="flex flex-col items-center gap-1 group">
            <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
              <ThumbsUp className="w-6 h-6 text-white group-hover:fill-white" />
            </button>
            <span className="text-white text-xs font-medium drop-shadow-md">42K</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
              <ThumbsDown className="w-6 h-6 text-white group-hover:fill-white" />
            </button>
            <span className="text-white text-xs font-medium drop-shadow-md">Dislike</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
              <MessageSquare className="w-6 h-6 text-white group-hover:fill-white" />
            </button>
            <span className="text-white text-xs font-medium drop-shadow-md">1,204</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
             <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-xs font-medium drop-shadow-md">Share</span>
          </div>
          <div className="flex flex-col items-center gap-1 group pb-2">
             <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
              <MoreHorizontal className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
