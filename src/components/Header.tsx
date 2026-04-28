import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Menu, Video, Bell, User, Mic } from 'lucide-react';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search/${searchTerm}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0f0f0f]">
      {/* Left items */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors hidden sm:block"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-1">
          <div className="bg-red-600 text-white p-1 rounded-lg">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter">YouTube Lite</span>
        </Link>
      </div>

      {/* Center items (Search) */}
      <div className="hidden sm:flex items-center flex-1 max-w-2xl ml-8 mr-4 gap-4">
        <form 
          onSubmit={handleSubmit}
          className="flex flex-1 items-center border border-[#303030] rounded-full overflow-hidden bg-[#121212]"
        >
          <div className="flex-1 flex items-center px-4">
            <Search className="w-4 h-4 text-gray-400 mr-2 sm:hidden" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent focus:outline-none py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="px-5 py-2 bg-[#222222] border-l border-[#303030] hover:bg-[#303030] transition-colors"
          >
            <Search className="w-5 h-5 text-gray-300" />
          </button>
        </form>
        <button className="p-2.5 bg-[#181818] hover:bg-[#303030] rounded-full transition-colors">
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile search toggle */}
      <div className="flex sm:hidden items-center gap-2">
        <button className="p-2 hover:bg-[#272727] rounded-full transition-colors">
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
    </header>
  );
}
