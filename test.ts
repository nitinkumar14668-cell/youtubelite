import { fetchFromAPI } from './src/services/youtube.ts';

async function test() {
  const result = await fetchFromAPI('channels?part=snippet,statistics,brandingSettings&id=xyz');
  console.log("Result items:", result?.items?.length);
  if (result.error) {
     console.log("Got error:", result);
  }
}

test();
