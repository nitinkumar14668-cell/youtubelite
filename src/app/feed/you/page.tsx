"use client";
import React from 'react';
import { History, PlaySquare, Clock, ThumbsUp, Scissors, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function YouPage() {
  const sections = [
    { title: 'History', icon: <History className="w-6 h-6" /> },
    { title: 'Your videos', icon: <PlaySquare className="w-6 h-6" /> },
    { title: 'Watch Later', icon: <Clock className="w-6 h-6" /> },
    { title: 'Liked videos', icon: <ThumbsUp className="w-6 h-6" /> },
    { title: 'Your clips', icon: <Scissors className="w-6 h-6" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 custom-scrollbar bg-[#0f0f0f] text-white">
      {/* User Header */}
      <div className="flex items-center gap-6 mb-10">
         <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-4xl font-bold shadow-lg">
           U
         </div>
         <div className="flex flex-col gap-1">
           <h1 className="text-3xl font-bold">You Focus</h1>
           <div className="text-sm text-gray-400 flex items-center gap-2">
             <span>@user-xyz123</span>
             <span>•</span>
             <Link href="/channel/you" className="text-blue-400 hover:text-blue-300 font-medium">View channel</Link>
           </div>
         </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center mb-4 mt-8">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <History className="w-6 h-6" /> History
           </h2>
           <button className="text-blue-400 text-sm font-medium hover:bg-blue-400/10 px-4 py-2 rounded-full transition-colors">View all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
           {/* Mock history items */}
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-40 shrink-0">
               <div className="bg-[#272727] aspect-video rounded-lg mb-2 relative overflow-hidden group cursor-pointer">
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlaySquare className="w-8 h-8 text-white" />
                 </div>
               </div>
               <div className="text-sm font-medium line-clamp-2">Watched Video {i + 1}</div>
               <div className="text-xs text-gray-400 mt-1">Channel Name</div>
             </div>
           ))}
        </div>

        <div className="h-px bg-[#272727] my-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((sec, idx) => (
            <Link href="/" key={idx} className="flex items-center gap-4 p-4 hover:bg-[#272727] rounded-xl cursor-pointer transition-colors">
               {sec.icon}
               <span className="font-semibold text-lg">{sec.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
