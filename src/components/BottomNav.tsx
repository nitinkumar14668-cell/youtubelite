"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, PlusCircle, LayoutList, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 w-full bg-[#0f0f0f] border-t border-[#272727] z-50 px-2 py-1 flex justify-between items-center text-[10px] font-medium text-gray-400">
      <Link href="/" className={`flex flex-col items-center p-2 min-w-[64px] ${pathname === '/' ? 'text-white' : 'hover:text-white'}`}>
        <Home className={`w-6 h-6 mb-1 ${pathname === '/' ? 'fill-white' : ''}`} />
        <span>Home</span>
      </Link>
      <Link href="/shorts" className={`flex flex-col items-center p-2 min-w-[64px] ${pathname.startsWith('/shorts') ? 'text-white' : 'hover:text-white'}`}>
        <PlaySquare className={`w-6 h-6 mb-1 ${pathname.startsWith('/shorts') ? 'fill-white' : ''}`} />
        <span>Shorts</span>
      </Link>
      <Link href="/broadcast" className={`flex flex-col items-center p-2 min-w-[64px] ${pathname === '/broadcast' ? 'text-white' : 'hover:text-white'}`}>
        <PlusCircle className="w-10 h-10 stroke-[1.5]" />
      </Link>
      <Link href="/subscriptions" className={`flex flex-col items-center p-2 min-w-[64px] ${pathname === '/subscriptions' ? 'text-white' : 'hover:text-white'}`}>
        <LayoutList className={`w-6 h-6 mb-1 ${pathname === '/subscriptions' ? 'fill-white' : ''}`} />
        <span>Subscriptions</span>
      </Link>
      <Link href="/feed/you" className={`flex flex-col items-center p-2 min-w-[64px] ${pathname === '/feed/you' ? 'text-white' : 'hover:text-white'}`}>
        <div className={`w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white mb-1 text-xs ${pathname === '/feed/you' ? 'ring-2 ring-white' : ''}`}>
          U
        </div>
        <span>You</span>
      </Link>
    </div>
  );
}
