import { NextRequest, NextResponse } from 'next/server';
import { keyManager, fetchWithCache } from '../../../lib/apiManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function performFetch(endpoint: string) {
  let attempts = 0;
  const maxAttempts = keyManager.getTotalKeys();

  while (attempts < maxAttempts) {
    const currentKey = keyManager.getCurrentKey();
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}/${endpoint}${separator}key=${currentKey}`;
    
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          keyManager.markCurrentKeyAsFailed();
          attempts++;
          continue;
        } else {
          const error = await response.json();
          throw new Error(`YouTube API Error: ${error.error?.message || response.statusText}`);
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Network error:", error);
      attempts++;
    }
  }
  throw new Error("All API key attempts failed.");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get('regionCode') || 'US';
  
  const endpoint = `videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=${regionCode}`;

  try {
    const data = await fetchWithCache(`trending_${regionCode}`, () => performFetch(endpoint), 15 * 60 * 1000);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
