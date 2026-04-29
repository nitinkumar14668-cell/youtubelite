"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  if (pathname === '/broadcast') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f0f] text-white">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative pb-12 sm:pb-0">
        <Sidebar isOpen={isSidebarOpen} />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
