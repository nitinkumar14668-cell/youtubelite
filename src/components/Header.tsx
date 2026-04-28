"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, Video, Bell, User, Mic, ArrowLeft, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      const newHistory = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchTerm(trimmed);
      setIsFocused(false);
      setShowMobileSearch(false);
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const removeFromHistory = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0f0f0f]">
      {/* Mobile Search View Header */}
      {showMobileSearch ? (
        <div className="flex items-center w-full gap-2" ref={searchRef}>
          <button 
            onClick={() => setShowMobileSearch(false)}
            className="p-2 hover:bg-[#272727] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form 
            onSubmit={handleSubmit}
            className="flex flex-1 items-center bg-[#222] rounded-full overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search YouTube Lite"
              className="w-full bg-transparent focus:outline-none px-4 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')}
                className="p-2 hover:text-white text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#303030] border-l border-[#404040]"
            >
              <Search className="w-4 h-4 text-gray-300" />
            </button>
          </form>
          <button className="p-2 bg-[#181818] rounded-full">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Left items */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#272727] rounded-full transition-colors hidden sm:block"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-1">
              <div className="bg-red-600 text-white p-1 rounded-lg">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tighter">YouTube Lite</span>
            </Link>
          </div>

          {/* Center items (Search) */}
          <div className="hidden sm:flex items-center flex-1 max-w-2xl ml-8 mr-4 gap-4 relative" ref={searchRef}>
            <form 
              onSubmit={handleSubmit}
              className={`flex flex-1 items-center border ${isFocused ? 'border-blue-500' : 'border-[#303030]'} rounded-full overflow-hidden bg-[#121212] relative z-20`}
            >
              <div className="flex-1 flex items-center px-4 relative">
                {isFocused && <Search className="w-4 h-4 text-gray-400 mr-2" />}
                {!isFocused && <Search className="w-4 h-4 text-gray-400 mr-2 sm:hidden" />}
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-transparent focus:outline-none py-2.5 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                />
                {searchTerm && isFocused && (
                  <button 
                    type="button" 
                    onClick={() => setSearchTerm('')}
                    className="p-1.5 hover:bg-[#303030] rounded-full text-gray-400 mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-[#222222] border-l border-[#303030] hover:bg-[#303030] transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5 text-gray-300" />
              </button>
            </form>
            <button className="p-2.5 bg-[#181818] hover:bg-[#303030] rounded-full transition-colors shrink-0">
              <Mic className="w-5 h-5" />
            </button>

            {/* Viewport for Advanced Search overlay */}
            <AnimatePresence>
              {isFocused && searchHistory.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 w-full bg-[#212121] border border-[#303030] rounded-xl shadow-2xl py-3 z-10"
                >
                  {searchHistory.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSearch(item)}
                      className="flex items-center justify-between px-4 py-1.5 hover:bg-[#333333] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium text-[15px]">{item}</span>
                      </div>
                      <button 
                        onClick={(e) => removeFromHistory(e, item)}
                        className="text-blue-400 hover:text-blue-300 text-sm hidden group-hover:block"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile search toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button 
               onClick={() => setShowMobileSearch(true)}
               className="p-2 hover:bg-[#272727] rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:block p-2 hover:bg-[#272727] rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="hidden sm:block p-2 hover:bg-[#272727] rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-1 sm:p-2">
              <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                U
              </div>
            </button>
          </div>
        </>
      )}
    </header>
  );
}
