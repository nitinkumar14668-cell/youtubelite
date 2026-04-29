import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

// List of provided API keys
const API_KEYS = [
  "AIzaSyA9H9zDYNTL20NIJvPVUg9hruW0NGzg1bY",
  "AIzaSyAmTB47cBxEZEzafeKEc_VdrrqG-VZhXzw",
  "AIzaSyCJDcC4N0tV0HqXqNxpxhvnTnxS7YhYiZM",
  "AIzaSyBYtwPaBqGCzj0UzcIDQFw4VaMI0yGp8UM",
  "AIzaSyDoFs9NDnG7u7wQ8TdqXoCsKRtu3g54Yi0",
  "AIzaSyA1XkVG8NNqbQk_ZL9JlMjUGs9L9IEZ3OA",
  "AIzaSyCiuJUBPNZ0Av0OxnuV6sLK5W37F5iU0wg",
  "AIzaSyBzH43Dz316tHtBoMDDpGRsEyUBGBkR63A",
  "AIzaSyB1J1cmLSJKQOGpuVZWZW0nIiYXjudYoTA",
  "AIzaSyBEgMeYBl2hVBM_PgnFM2WGFw7daOT98MI",
  "AIzaSyBUXU97K1SytnMHcxJM76EcGxfgb155u1U",
  "AIzaSyB-7IP69Ih_6aNI4OsBDj6q-Nr0iTSxdwM",
  "AIzaSyCdMudMybB1_GmuBOlRGhsUttJQibdu_vU",
  "AIzaSyDpRI4V9cjSNN1G1psAx4Ep4jSjRM1-kAs",
  "AIzaSyDxTmLZrOmVW8zyTxN-3ENZsmzcV72VVXw",
  "AIzaSyD-yWjiGsqN6_DtSZzseHhZRQ5vJMTE70A",
  "AIzaSyBYmdyhqLyD14v4EY3rhitCMe8K8eS3SpU",
  "AIzaSyCoUjp8bKEgUJq-UfK-A3colFPQz7S9eSs",
  "AIzaSyDUwuBgT-OFnOkoCQY494ahaosqbsHLTUA",
  "AIzaSyBEP8wq45Mu2VaU9cJJC1a-E2ylDD4Z7VE",
  "AIzaSyB2qeWf378Drb_9zyu6d0X6-_wXJOFUzWs",
  "AIzaSyACwN6AghdaJW97eAFaQAWB_Pe6pC_n_K0",
  "AIzaSyAb8JvgBt32VjkmRkMEDcGYdmvpztaMt7E",
  "AIzaSyAn_9ejLAl6FXcUu5dgqwCDORtFiU6y8Js",
  "AIzaSyA3xutskL41RPa5zEfUrd5bIXzTavY3btc",
  "AIzaSyCoTsgimZ9L1yRzsQC-RINxFP6qSJBU4zU",
  "AIzaSyBc15dIslUr3pSQg-_N5K9X-uSFDVqzjaA",
  "AIzaSyBTfUQu8-O-hhZueWM3VLhRV5miVYjFlcU",
  "AIzaSyDMjOQujD7MUud83-LYD-kj2IiVsERI-L0",
  "AIzaSyCQkQ1qu6qX9YuvTHHr0I4BbFuP4yNToko",
  "AIzaSyA-PUmjrPaIWsdrrBXckkfyRZaAr43fOc8",
  "AIzaSyApiGTDZdKWkUJBlU5MSXRyEORpacfGadc",
  "AIzaSyD6pYoZT_bULkX_xIfjtWd6aV17rDS6f_I",
  "AIzaSyC32fhwHLron2Pzzxgp7rLAyERfA29MVHw",
  "AIzaSyC5IZi89mLZ7FLr0uS_ge4ZcLCUgITJz2Q",
  "AIzaSyCXmO3BJG4P7AauAEVt3jyTcrbBRyIEUFU",
  "AIzaSyDqvwpN_MzLM-eRrs_idZmpOWWAgEA-TaQ",
  "AIzaSyCd7I5PH1_6tyu4bGGMXgCZM-pRJMYUQx4",
  "AIzaSyACRfUg4Azm82iAqszsLrcLU6EX0cZGyCc",
  "AIzaSyA2U7gjXpMylxvmZiAMwsaPj1Uu5Wut8EI"
];

class KeyManager {
  private currentIndex = 0;
  private failedKeys = new Set<string>();

  private lastResetTime = 0;

  getCurrentKey(): string | null {
    // Only search available keys
    for (let i = 0; i < API_KEYS.length; i++) {
      const idx = (this.currentIndex + i) % API_KEYS.length;
      if (!this.failedKeys.has(API_KEYS[idx])) {
        this.currentIndex = idx;
        return API_KEYS[idx];
      }
    }
    
    // If all fail, check if we should reset
    const now = Date.now();
    if (now - this.lastResetTime > 15 * 60 * 1000) { // 15 mins cooldown
      this.failedKeys.clear();
      this.lastResetTime = now;
      return API_KEYS[0];
    }

    return null; // All keys are exhausted and in cooldown
  }

  markCurrentKeyAsFailed() {
    const currentKey = API_KEYS[this.currentIndex];
    this.failedKeys.add(currentKey);
    this.currentIndex = (this.currentIndex + 1) % API_KEYS.length;
  }

  getTotalKeys() {
    return API_KEYS.length;
  }
}

export const keyManager = new KeyManager();

// ======== CACHING SYSTEM ========

interface CacheItem {
  data: any;
  timestamp: number;
}

// Memory Cache
const memoryCache = new Map<string, CacheItem>();

// Cloud/Disk Cache (mocked via os.tmpdir for persistence)
const CACHE_DIR = path.join(os.tmpdir(), 'youtube_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getCacheHash(query: string) {
  return crypto.createHash('md5').update(query).digest('hex');
}

function readFromCloudCache(key: string): CacheItem | null {
  const hash = getCacheHash(key);
  const cachePath = path.join(CACHE_DIR, `${hash}.json`);
  
  if (fs.existsSync(cachePath)) {
    try {
      const data = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(data) as CacheItem;
    } catch (e) {
      console.error("Failed to read cloud cache:", e);
    }
  }
  return null;
}

function writeToCloudCache(key: string, item: CacheItem) {
  const hash = getCacheHash(key);
  const cachePath = path.join(CACHE_DIR, `${hash}.json`);
  try {
    fs.writeFileSync(cachePath, JSON.stringify(item), 'utf8');
  } catch (e) {
    console.error("Failed to write to cloud cache:", e);
  }
}

// Main Cache Retriever
export async function fetchWithCache(
  key: string, 
  fetcher: () => Promise<any>, 
  ttlMs = 15 * 60 * 1000 // default 15 mins
) {
  const now = Date.now();

  // 1. Check Memory Cache
  if (memoryCache.has(key)) {
    const cached = memoryCache.get(key)!;
    if (now - cached.timestamp < ttlMs) {
      return cached.data;
    }
  }

  // 2. Check Cloud Cache
  const cloudCached = readFromCloudCache(key);
  if (cloudCached && now - cloudCached.timestamp < ttlMs) {
    // Populate Memory Cache
    memoryCache.set(key, cloudCached);
    return cloudCached.data;
  }

  // 3. Not Found or expired -> Fetch fresh data
  try {
    const data = await fetcher();
    
    // Save to Cache
    const newCacheItem: CacheItem = { data, timestamp: now };
    memoryCache.set(key, newCacheItem);
    writeToCloudCache(key, newCacheItem);
    
    return data;
  } catch (error) {
    // Fallback: If fetch fails, try to return stale cache from Memory or Cloud
    if (memoryCache.has(key)) {
      return memoryCache.get(key)!.data;
    }
    if (cloudCached) {
      return cloudCached.data;
    }
    throw error;
  }
}
