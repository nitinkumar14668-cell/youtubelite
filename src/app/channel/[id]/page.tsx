"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { fetchFromAPI, resetApiKeys } from '../../../services/youtube';
import { enrichVideos } from '../../../lib/youtubeUtils';
import VideoCard from '../../../components/VideoCard';
import QuotaExceededComponent from '../../../components/QuotaExceeded';
import Image from 'next/image';

export default function Channel() {
  const params = useParams();
  const id = params?.id as string;
  const [channelDetail, setChannelDetail] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setQuotaExceeded(false);
    try {
      const channelData = await fetchFromAPI(`channels?part=snippet,statistics,brandingSettings&id=${encodeURIComponent(id)}`);
      if (channelData?.error === "quota_exceeded") {
        setQuotaExceeded(true);
        return;
      }
      setChannelDetail(channelData?.items?.[0]);

      const videosData = await fetchFromAPI(`search?channelId=${encodeURIComponent(id)}&part=snippet&order=date&maxResults=20`);
      const enrichedVideos = await enrichVideos(videosData?.items || [], fetchFromAPI);
      setVideos(enrichedVideos);
    } catch (error) {
      console.error("Error fetching channel details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchResults();
    }
  }, [id, fetchResults]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (quotaExceeded) {
    return (
      <div className="flex-1 bg-[#0f0f0f]">
        <QuotaExceededComponent onRetry={async () => {
           await resetApiKeys();
           fetchResults();
        }} />
      </div>
    );
  }

  if (!channelDetail) {
    return <div className="flex-1 p-8 text-center bg-[#0f0f0f] text-white">Channel not found.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f0f] text-white">
      {/* Channel Header Banner (Use a default if not present or just a generic gradient) */}
      <div 
        className="w-full h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-purple-800 to-red-800 object-cover"
        style={channelDetail?.brandingSettings?.image?.bannerExternalUrl ? { backgroundImage: `url(${channelDetail.brandingSettings.image.bannerExternalUrl}=w1920-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj)`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      />
      
      {/* Channel Info */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 -mt-12 sm:-mt-16 border-4 border-[#0f0f0f] rounded-full bg-[#272727] overflow-hidden shrink-0">
            <Image 
              src={channelDetail?.snippet?.thumbnails?.high?.url || 'https://via.placeholder.com/150'} 
              alt={channelDetail?.snippet?.title || 'Avatar'}
              fill
              sizes="(max-width: 640px) 96px, 128px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{channelDetail?.snippet?.title}</h1>
            <div className="text-[#aaaaaa] text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3">
              <span className="font-medium text-white">{channelDetail?.snippet?.customUrl || `@${channelDetail?.snippet?.title.replace(/\s+/g, '')}`}</span>
              <span className="hidden sm:inline">•</span>
              <span>
                {Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(channelDetail?.statistics?.subscriberCount || 0)} subscribers
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{channelDetail?.statistics?.videoCount} videos</span>
              {channelDetail?.snippet?.country && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>{channelDetail?.snippet?.country}</span>
                </>
              )}
            </div>
            {channelDetail?.brandingSettings?.channel?.keywords && (
              <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                {channelDetail.brandingSettings.channel.keywords.replace(/"/g, '')}
              </p>
            )}
            <p className="text-sm text-[#aaaaaa] line-clamp-2 max-w-xl mb-4">
              {channelDetail?.snippet?.description}
            </p>
            <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Channel Navigation Links */}
        <div className="flex border-b border-[#272727] mb-6 overflow-x-auto custom-scrollbar">
          {['HOME', 'VIDEOS', 'PLAYLISTS', 'COMMUNITY', 'CHANNELS', 'ABOUT'].map((tab) => (
            <button 
              key={tab} 
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${tab === 'VIDEOS' ? 'text-white border-b-2 border-white' : 'text-[#aaaaaa] hover:text-white transition-colors'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Channel Videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-4 sm:gap-y-10">
          {videos.map((video, idx) => (
            <VideoCard key={idx} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
