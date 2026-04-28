"use client";
import React from 'react';
import Link from 'next/link';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, Flame, Music, Gamepad2, Trophy, Settings, HelpCircle, MessageSquare } from 'lucide-react';

const categories = [
  { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
  { name: 'Shorts', icon: <PlaySquare className="w-5 h-5" />, path: '/search/shorts' },
  { name: 'Subscriptions', icon: <Compass className="w-5 h-5" />, path: '/' },
  { divider: true },
  { name: 'History', icon: <Clock className="w-5 h-5" />, path: '/' },
  { name: 'Liked videos', icon: <ThumbsUp className="w-5 h-5" />, path: '/' },
  { divider: true },
  { title: 'Explore' },
  { name: 'Trending', icon: <Flame className="w-5 h-5" />, path: '/search/trending' },
  { name: 'Music', icon: <Music className="w-5 h-5" />, path: '/search/music' },
  { name: 'Gaming', icon: <Gamepad2 className="w-5 h-5" />, path: '/search/gaming' },
  { name: 'Sports', icon: <Trophy className="w-5 h-5" />, path: '/search/sports' },
  { divider: true },
  { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/' },
  { name: 'Help', icon: <HelpCircle className="w-5 h-5" />, path: '/' },
  { name: 'Send feedback', icon: <MessageSquare className="w-5 h-5" />, path: '/' },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  // If not open, returning an empty layout placeholder helps layout not jump, but let's just use CSS classes
  return (
    <aside className={`${isOpen ? 'w-60' : 'w-20'} sm:flex flex-col shrink-0 h-[calc(100vh-64px)] overflow-y-auto bg-[#0f0f0f] pt-3 hidden transition-all duration-300 ease-in-out border-r border-[#272727] custom-scrollbar`}>
      {categories.map((cat, index) => {
        if (cat.divider) {
          return <div key={`divider-${index}`} className="h-px bg-[#272727] my-3 w-full" />;
        }
        
        if (cat.title) {
          return isOpen ? (
            <div key={`title-${cat.title}`} className="px-6 py-2 text-base font-semibold">
              {cat.title}
            </div>
          ) : null;
        }

        return (
          <Link
            href={cat.path || '/'}
            key={cat.name}
            className={`flex items-center gap-5 px-6 py-2.5 mx-2 rounded-lg hover:bg-[#272727] transition-colors ${isOpen ? '' : 'justify-center !px-0'}`}
            title={!isOpen ? cat.name : undefined}
          >
            {cat.icon}
            {isOpen && <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{cat.name}</span>}
          </Link>
        );
      })}
    </aside>
  );
}
