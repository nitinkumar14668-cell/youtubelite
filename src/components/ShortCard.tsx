"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

export default function ShortCard({ video }: { video: any }) {
  const router = useRouter();
  const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
  
  if (!videoId) return null;

  const title = video.snippet?.title || '';
  const thumbnails = video.snippet?.thumbnails || {};
  // For shorts, we ideally want a vertical thumbnail. YouTube sets high res to 480x360 which is cropped.
  // We'll use the highest available and object-cover it vertically.
  const thumbnail = thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

  return (
    <motion.div 
      onClick={() => router.push(`/watch/${videoId}`)}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col gap-2 w-full cursor-pointer relative"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        <h3 
          className="absolute bottom-2 left-2 right-6 font-semibold text-white text-sm line-clamp-2 drop-shadow-md"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <button 
          className="absolute top-1 right-1 p-1 opacity-100 hover:bg-black/30 rounded-full transition-all"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <MoreVertical className="w-5 h-5 text-white drop-shadow-md" />
        </button>
      </div>
    </motion.div>
  );
}
