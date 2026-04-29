export const enrichVideos = async (items: any[], fetchFromAPI: (url: string) => Promise<any>) => {
  if (!items || items.length === 0) return [];
  const videoIds = items.map(item => item.id?.videoId || item.id).filter(id => typeof id === 'string').join(',');
  if (!videoIds) return items;
  
  try {
    const detailedData = await fetchFromAPI(`videos?part=snippet,statistics&id=${videoIds}`);
    if (detailedData?.error === "quota_exceeded") {
       return items;
    }
    
    const detailedMap = new Map();
    if (detailedData.items) {
      detailedData.items.forEach((item: any) => {
        detailedMap.set(item.id, item);
      });
    }
    
    return items.map(item => {
      const id = item.id?.videoId || item.id;
      const details = detailedMap.get(id);
      if (details) {
        return {
           ...item,
           snippet: details.snippet || item.snippet,
           statistics: details.statistics
        };
      }
      return item;
    });
  } catch (error) {
    console.error("Failed to enrich videos", error);
    return items;
  }
};
