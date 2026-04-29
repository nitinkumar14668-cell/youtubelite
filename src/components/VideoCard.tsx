"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import { motion } from 'motion/react';

import { MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: any;
  layout?: 'grid' | 'row' | 'search';
}

export default function VideoCard({ video, layout = 'grid' }: VideoCardProps) {
  const isRow = layout === 'row';
  const isSearch = layout === 'search';
  const isGridClass = layout === 'grid';
  const router = useRouter();
  // Sometimes API returns search endpoint results where id is an object
  const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
  
  if (!videoId) return null;

  const title = video.snippet?.title || '';
  const channelTitle = video.snippet?.channelTitle || '';
  const publishTime = video.snippet?.publishedAt || video.snippet?.publishTime;
  const thumbnails = video.snippet?.thumbnails || {};
  const thumbnail = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
  
  // Fake views for when API doesn't return statistics in search
  const views = video.statistics?.viewCount 
    ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(video.statistics.viewCount)
    : Math.floor(Math.random() * 900 + 10) + 'K'; // Fallback if no stats

  const timeAgo = publishTime ? formatDistanceToNow(new Date(publishTime), { addSuffix: true }) : '';

  const handleCardClick = () => {
    router.push(`/watch/${videoId}`);
  };

  const containerClass = 
    layout === 'row' ? 'flex-row gap-2 sm:gap-4' : 
    layout === 'search' ? 'flex-col sm:flex-row gap-0 sm:gap-4 mb-4' : 
    'flex-col gap-3';

  const thumbnailContainerClass =
    layout === 'row' ? 'w-40 sm:w-48 shrink-0 rounded-xl' :
    layout === 'search' ? 'w-full sm:w-[360px] shrink-0 rounded-none sm:rounded-xl' :
    'w-full rounded-none';

  const imageClass =
    layout === 'row' ? 'h-24 sm:h-28' :
    layout === 'search' ? 'aspect-video sm:h-[200px]' :
    'aspect-video';

  return (
    <motion.div 
      onClick={handleCardClick}
      whileTap={{ scale: 0.98 }}
      className={`group flex ${containerClass} w-full transition-transform cursor-pointer relative ${layout === 'grid' ? 'mb-4 sm:mb-0' : ''}`}
    >
      <div className={`relative overflow-hidden transition-all duration-300 group-hover:rounded-none ${thumbnailContainerClass}`}>
        <img 
          src={thumbnail} 
          alt={title}
          className={`w-full bg-[#222] object-cover transition-transform duration-300 group-hover:scale-105 ${imageClass}`}
        />
        {/* Timestamp placeholder */}
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium transition-opacity duration-300 group-hover:opacity-0">
          {Math.floor(Math.random() * 20 + 2)}:{Math.floor(Math.random() * 50 + 10)}
        </div>
      </div>
      
      <div className={`flex gap-3 ${layout === 'search' ? 'px-3 py-3 sm:px-0 sm:py-0' : layout === 'grid' ? 'px-3 sm:px-0' : isRow ? 'flex-1 py-1' : ''}`}>
        {/* Only hide avatar on mobile if layout is grid/row? Wait, mobile search DOES show avatar. So instead of !isRow, we show it everywhere except desktop 'row' maybe? Or hide on 'row', show on 'grid' and 'search'. */}
        {layout !== 'row' && (
          <div className="shrink-0 pt-0.5">
            <Link href={video.snippet?.channelId ? `/channel/${video.snippet.channelId}` : '#'} onClick={(e) => { e.stopPropagation(); if(!video.snippet?.channelId) e.preventDefault(); }}>
              <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-sm hover:opacity-80 transition-opacity overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(channelTitle)}&background=random`} alt={channelTitle} className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        )}
        
        <div className="flex flex-col overflow-hidden w-full pr-6 relative">
          <h3 
            className={`font-normal text-white ${layout === 'row' ? 'text-base sm:text-lg mb-1' : layout === 'search' ? 'text-base sm:text-lg mb-0.5' : 'text-base font-semibold line-clamp-2'}`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div className={`text-[13px] text-[#aaaaaa] flex ${layout === 'row' ? 'flex-col sm:flex-row sm:items-center' : layout === 'search' ? 'flex-row items-center flex-wrap' : 'flex-col'} mt-0.5`}>
            <Link href={video.snippet?.channelId ? `/channel/${video.snippet.channelId}` : '#'} className="hover:text-white transition-colors block" onClick={(e) => { e.stopPropagation(); if(!video.snippet?.channelId) e.preventDefault(); }}>
              {channelTitle}
            </Link>
            <div className={`flex items-center ${layout === 'row' ? 'sm:before:content-["•"] sm:before:mx-1 shadow-sm' : layout === 'search' ? 'before:content-["•"] before:mx-1' : ''}`}>
              <span>{views} views</span>
              <span className="mx-1">•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          {(layout === 'row' || layout === 'search') && video.snippet?.description && (
            <p 
              className={`text-xs text-[#aaaaaa] line-clamp-2 hidden sm:block ${layout === 'search' ? 'mt-3' : 'mt-2'}`}
              dangerouslySetInnerHTML={{ __html: video.snippet.description }}
            />
          )}

          {/* More Vertical 3-dots */}
          <button 
            className="absolute top-0 -right-2 p-1.5 opacity-0 group-hover:opacity-100 sm:opacity-100 hover:bg-[#272727] rounded-full transition-all"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
