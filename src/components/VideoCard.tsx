import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  video: any;
  layout?: 'grid' | 'row';
}

export default function VideoCard({ video, layout = 'grid' }: VideoCardProps) {
  const isRow = layout === 'row';
  const navigate = useNavigate();
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
    navigate(`/watch/${videoId}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group flex ${isRow ? 'flex-row gap-2 sm:gap-4' : 'flex-col gap-3'} w-full transition-transform cursor-pointer`}
    >
      <div className={`relative ${isRow ? 'w-40 sm:w-48 shrink-0' : 'w-full'}`}>
        <img 
          src={thumbnail} 
          alt={title}
          className={`w-full bg-[#222] object-cover ${isRow ? 'rounded-xl h-24 sm:h-28' : 'rounded-xl aspect-video'}`}
        />
        {/* Timestamp placeholder */}
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">
          {Math.floor(Math.random() * 20 + 2)}:{Math.floor(Math.random() * 50 + 10)}
        </div>
      </div>
      
      <div className={`flex gap-3 ${isRow ? 'flex-1 py-1' : ''}`}>
        {!isRow && (
          <div className="shrink-0 pt-0.5">
            <Link to={video.snippet?.channelId ? `/channel/${video.snippet.channelId}` : '#'} onClick={(e) => { e.stopPropagation(); if(!video.snippet?.channelId) e.preventDefault(); }}>
              <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center text-sm hover:opacity-80 transition-opacity">
                {channelTitle.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        )}
        
        <div className="flex flex-col overflow-hidden">
          <h3 
            className={`font-semibold text-white ${isRow ? 'text-base sm:text-lg mb-1' : 'text-base line-clamp-2'}`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div className={`text-sm text-[#aaaaaa] flex ${isRow ? 'flex-col sm:flex-row sm:items-center' : 'flex-col'} mt-0.5`}>
            <Link to={video.snippet?.channelId ? `/channel/${video.snippet.channelId}` : '#'} className="hover:text-white transition-colors block" onClick={(e) => { e.stopPropagation(); if(!video.snippet?.channelId) e.preventDefault(); }}>
              {channelTitle}
            </Link>
            <div className={`flex items-center ${isRow ? 'sm:before:content-["•"] sm:before:mx-1 shadow-sm' : ''}`}>
              <span>{views} views</span>
              <span className="mx-1">•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          {isRow && video.snippet?.description && (
            <p 
              className="text-xs text-[#aaaaaa] mt-2 line-clamp-2 hidden sm:block"
              dangerouslySetInnerHTML={{ __html: video.snippet.description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
