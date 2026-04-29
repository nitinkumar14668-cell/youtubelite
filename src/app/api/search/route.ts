import { NextRequest, NextResponse } from 'next/server';
import { keyManager, fetchWithCache } from '../../../lib/apiManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function performFetch(endpoint: string) {
  let attempts = 0;
  const maxAttempts = 5;

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
      attempts++;
    }
  }
  throw new Error("All API key attempts failed.");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const endpoint = `search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video`;

  try {
    const data = await fetchWithCache(`search_${q}`, () => performFetch(endpoint), 15 * 60 * 1000);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
