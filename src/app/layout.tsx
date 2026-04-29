import "./globals.css";
import React from 'react';
import ClientLayout from '../components/ClientLayout';
import LocationProvider from '../components/LocationProvider';

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
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://yt3.ggpht.com" />
        <link rel="preconnect" href="https://ui-avatars.com" />
      </head>
      <body className="bg-[#0f0f0f] text-white">
        <LocationProvider />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
