"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';

export default function VideoOverlayAd({ onSkip }: { onSkip: () => void }) {
  const [skipTimer, setSkipTimer] = useState(5);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = ["Install Now", "Limited Offer", "Try Premium", "Best Deal"];

  useEffect(() => {
    const timer = setInterval(() => {
      setSkipTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 10000 + Math.random() * 5000);
    return () => clearInterval(msgTimer);
  }, [messages.length]);

  return (
    <div className="absolute inset-0 z-20 bg-black overflow-hidden flex select-none">
      <div 
        className="w-full h-full relative cursor-pointer" 
        onClick={() => {
          // Open ad destination in new tab
          window.open('https://example.com', '_blank');
        }}
      >
        <motion.div 
          className="absolute inset-0 opacity-40 bg-gradient-to-tr from-red-900 via-purple-900 to-black mix-blend-screen"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black/80 pointer-events-none" />
        
        {/* Ad Badge top left */}
        <div className="absolute top-4 left-4 flex gap-2 items-center z-30">
          <span className="bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">Ad</span>
          <span className="text-white bg-black/50 backdrop-blur rounded px-2 py-0.5 text-xs border border-white/10">1 of 1</span>
        </div>
        
        {/* Ad Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-4 text-center">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={messageIndex}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-6xl font-black text-white/90 drop-shadow-2xl tracking-tighter"
            >
              {messages[messageIndex]}
            </motion.h2>
          </AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 px-6 py-2.5 bg-blue-600 rounded-full font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center gap-2 pointer-events-auto hover:bg-blue-500 transition-colors"
          >
            Learn More
          </motion.div>
        </div>

        {/* Skip Button Area */}
        <div className="absolute bottom-8 right-0 z-30 flex gap-2 items-center">
          <div 
            className={`
              bg-black/70 backdrop-blur-md border border-white/10 border-r-0 rounded-l-lg 
              flex items-center transition-all overflow-hidden
              ${skipTimer === 0 ? 'hover:bg-white/10 cursor-pointer active:scale-95' : 'cursor-default'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (skipTimer === 0) onSkip();
            }}
          >
            {skipTimer > 0 ? (
              <div className="px-5 py-2.5 flex items-center">
                <span className="text-white/90 text-sm font-medium">Skip Ad in {skipTimer}s</span>
              </div>
            ) : (
              <div className="px-5 py-2.5 flex items-center gap-2">
                <span className="text-white text-sm font-medium">Skip Ad</span>
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
