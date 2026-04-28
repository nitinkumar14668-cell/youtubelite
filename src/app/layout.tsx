import "./globals.css";
import React from 'react';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'YouTube Lite',
  description: 'A lightweight YouTube clone using Next.js and the YouTube Data API v3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
