import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yt-clone-omega.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/watch/[id]'], // You can restrict crawling of specific dynamic routes if needed
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
