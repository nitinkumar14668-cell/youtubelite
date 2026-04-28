"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const AD_MESSAGES = [
  "Install Now",
  "Limited Offer",
  "Try Premium",
  "Best Deal",
  "Subscribe Today",
  "Get 50% Off"
];

export default function DummyAd({ layout = 'grid' }: { layout?: 'grid' | 'row' | 'search' }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % AD_MESSAGES.length);
    }, 10000 + Math.random() * 5000); // 10-15 seconds
    return () => clearInterval(interval);
  }, []);

  const containerClass = 
    layout === 'row' ? 'flex-row gap-2 sm:gap-4' : 
    layout === 'search' ? 'flex-col sm:flex-row gap-0 sm:gap-4 mb-4' : 
    'flex-col gap-3 mb-6';

  const thumbnailContainerClass =
    layout === 'row' ? 'w-40 sm:w-48 shrink-0 rounded-xl' :
    layout === 'search' ? 'w-full sm:w-[360px] shrink-0 rounded-none sm:rounded-xl' :
    'w-full rounded-xl';

  const imageClass =
    layout === 'row' ? 'h-24 sm:h-28' :
    layout === 'search' ? 'aspect-video sm:h-[200px]' :
    'aspect-video';

  return (
    <div className={`flex w-full ${containerClass} cursor-pointer group relative`}>
      <div className={`relative overflow-hidden transition-all duration-300 group-hover:rounded-none ${thumbnailContainerClass}`}>
        <div className={`w-full ${imageClass} bg-gradient-to-br from-indigo-900 via-purple-900 to-[#0f0f0f] border hover:border-purple-500/50 border-white/5 transition-colors flex items-center justify-center relative overflow-hidden bg-black/40 backdrop-blur-sm box-border`}>
          {/* Animated background gradient */}
          <motion.div 
            className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="z-10 flex flex-col items-center justify-center text-center p-4">
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded mb-2 uppercase tracking-wider shadow-sm">Ad</span>
            <AnimatePresence mode="wait">
              <motion.h3 
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white font-bold text-lg sm:text-2xl shadow-black drop-shadow-md tracking-tight"
              >
                {AD_MESSAGES[messageIndex]}
              </motion.h3>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className={`flex gap-3 ${layout === 'search' ? 'px-3 py-3 sm:px-0 sm:py-0' : layout === 'row' ? 'flex-1 py-1' : ''}`}>
        {layout !== 'row' && (
          <div className="shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
              AD
            </div>
          </div>
        )}
        <div className="flex flex-col w-full pr-6 justify-center">
          <div className={`font-medium text-white ${layout === 'row' ? 'text-base sm:text-lg mb-1' : layout === 'search' ? 'text-base sm:text-lg mb-0.5' : 'text-base line-clamp-2'}`}>
            <span className="bg-white text-black text-[10px] font-bold px-1 rounded mr-2 uppercase -translate-y-0.5 inline-block">Sponsored</span>
            Discover the best deals online today
          </div>
          <div className={`text-[13px] text-[#aaaaaa] mt-0.5`}>
            Sponsored Link
          </div>
          
          <button className={`mt-2 text-sm bg-[#3ea6ff]/10 hover:bg-[#3ea6ff]/20 text-[#3ea6ff] font-medium py-1.5 px-4 rounded-full w-max transition-colors active:scale-95 ${layout === 'row' ? 'hidden sm:block' : ''}`}>
            {AD_MESSAGES[messageIndex]}
          </button>
        </div>
      </div>
    </div>
  );
}
