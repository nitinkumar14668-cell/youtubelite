import { NextRequest, NextResponse } from 'next/server';
import { keyManager, fetchWithCache } from '../../../lib/apiManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // The fetcher function tries to fetch data using keys
  // It handles rotation natively.
  const fetcher = async () => {
    let attempts = 0;
    const maxAttempts = keyManager.getTotalKeys(); // try up to all keys if failures occur

    while (attempts < maxAttempts) {
      const currentKey = keyManager.getCurrentKey();
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${BASE_URL}/${endpoint}${separator}key=${currentKey}`;
      
      try {
        const response = await fetch(url, {
          // ensure no local Next.js fetch caching intercepts, 
          // we are doing our own caching!
          cache: 'no-store' 
        });

        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            console.warn(`Key ${currentKey.substring(0,8)}... hit quota or forbidden. Status: ${response.status}`);
            // Quota exceeded or forbidden. Switch key.
            keyManager.markCurrentKeyAsFailed();
            attempts++;
            continue; // try next key
          } else {
            const error = await response.json();
            throw new Error(`YouTube API Error: ${error.error?.message || response.statusText}`);
          }
        }

        return await response.json();
      } catch (error) {
        console.error("Network error inside fetcher:", error);
        attempts++;
      }
    }
    
    throw new Error("All API key attempts failed or network is unreachable.");
  };

  try {
    // 15 mins cache TTL for trending/search usually, we can make it variable based on endpoint but 15m is fine for everything in our app.
    let ttlMs = 15 * 60 * 1000;
    
    if (endpoint.startsWith('videos?')) {
      // videos don't change often, cache longer (1 hour)
      ttlMs = 60 * 60 * 1000; 
    }

    // Pass 'endpoint' as the cache key so exact queries hit exact caches.
    const data = await fetchWithCache(endpoint, fetcher, ttlMs);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API proxy failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
