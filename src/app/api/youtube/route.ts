import { NextRequest, NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const qs = searchParams.get('qs') || '';
  
  const params = new URLSearchParams(qs);

  try {
    if (path === 'search') {
      const q = params.get('q') || 'trending';
      const channelId = params.get('channelId');
      
      let r;
      if (channelId) {
         // rough fallback: search with channel ID
         r = await ytSearch(channelId + ' videos');
      } else {
         r = await ytSearch(q);
      }
      
      return NextResponse.json({
        items: r.videos.slice(0, 20).map(v => ({
          id: { videoId: v.videoId },
          snippet: {
            title: v.title,
            description: v.description,
            thumbnails: {
              medium: { url: v.thumbnail || v.image },
              high: { url: v.image },
            },
            channelTitle: v.author.name,
            channelId: v.author.url.split('/').pop() || 'channel',
            publishedAt: v.uploadDate ? new Date(v.uploadDate).toISOString() : new Date().toISOString(),
          }
        }))
      });
    } else if (path === 'videos') {
      const id = params.get('id');
      if (!id) return NextResponse.json({ items: [] });
      const v = await ytSearch({ videoId: id });
      
      return NextResponse.json({
        items: [{
          id: v.videoId,
          snippet: {
            title: v.title,
            description: v.description,
            thumbnails: { medium: { url: v.thumbnail || v.image }, high: { url: v.thumbnail || v.image } },
            channelTitle: v.author.name,
            publishedAt: v.uploadDate ? new Date(v.uploadDate).toISOString() : new Date().toISOString(),
          },
          statistics: {
            viewCount: v.views ? v.views.toString() : '0',
            likeCount: '0'
          }
        }]
      });
    } else if (path === 'channels') {
       return NextResponse.json({
         items: [{
           id: params.get('id'),
           snippet: {
             title: 'YouTube Channel',
             description: 'Information limited in fallback mode.',
             thumbnails: { default: { url: '' }, high: { url: '' } }
           },
           statistics: { subscriberCount: '0', videoCount: '0' },
           brandingSettings: { image: { bannerExternalUrl: '' } }
         }]
       });
    } else if (path === 'commentThreads') {
       return NextResponse.json({ items: [] });
    }
    
    return NextResponse.json({ items: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, items: [] }, { status: 500 });
  }
}
