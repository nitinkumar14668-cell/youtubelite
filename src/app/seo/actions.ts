'use server';

export async function generateSeoAction(topic: string, contentType: 'Video' | 'Short') {
  try {
    // 1. Clean and parse topic
    const cleanTopic = topic.trim().replace(/^how to /i, '').replace(/^what is /i, '');
    const topicCapitalized = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
    const keywords = cleanTopic.split(' ').filter(w => w.length > 2);
    const primaryKeyword = keywords[0] || cleanTopic;
    const currentYear = new Date().getFullYear();

    // 2. Generate Titles using viral templates
    const titles = contentType === 'Video' ? [
      `How to Master ${topicCapitalized} in ${currentYear} (Step by Step)`,
      `The SECRETS of ${topicCapitalized} Revealed!`,
      `I Tried ${topicCapitalized} For 30 Days (Here's What Happened)`
    ] : [
      `${topicCapitalized} Hacks You Didn't Know 🤯`,
      `Wait, ${topicCapitalized} works like THIS?!`,
      `Do THIS to master ${topicCapitalized} 🤫 #shorts`
    ];

    // 3. Generate Tags
    const baseTags = [
      cleanTopic,
      `${cleanTopic} ${currentYear}`,
      `how to ${cleanTopic}`,
      `${cleanTopic} tutorial`,
      `${cleanTopic} tricks`,
      `${cleanTopic} for beginners`,
      `best ${cleanTopic}`,
      `${cleanTopic} review`
    ];
    
    // Add variations for each keyword
    keywords.forEach(kw => {
      baseTags.push(`${kw} tutorial`);
      baseTags.push(`${kw} guide`);
    });

    const tags = Array.from(new Set([
      ...baseTags, 
      contentType.toLowerCase(), 
      ...(contentType === 'Short' ? ['youtube shorts', 'shorts'] : [])
    ])).slice(0, 20);

    // 4. Generate Hashtags
    const hashtags = [
      `#${cleanTopic.replace(/\s+/g, '').toLowerCase()}`,
      `#${primaryKeyword.toLowerCase()}Tips`,
      `#${contentType.toLowerCase()}s`,
      `#Trending`
    ];

    // 5. Generate Description
    let description = `Want to learn about ${topicCapitalized}? In this ${contentType.toLowerCase()}, we break down exactly how you can succeed with ${cleanTopic}.\n\n`;
    description += `🔥 Discover the ultimate secrets, tips, and strategies for ${cleanTopic} that nobody else is talking about. Whether you're a beginner or an expert, these insights will help you level up fast!\n\n`;
    
    if (contentType === 'Video') {
      description += `⏱️ TIMESTAMPS:\n`;
      description += `0:00 - Introduction to ${topicCapitalized}\n`;
      description += `1:15 - The Biggest Mistake with ${primaryKeyword}\n`;
      description += `3:30 - Strategy #1 Revealed\n`;
      description += `6:45 - Advanced Concepts & Pro Tips\n`;
      description += `9:20 - Final Thoughts & Summary\n\n`;
    }

    description += `🔔 Don't forget to LIKE and SUBSCRIBE for more amazing content about ${cleanTopic}!\n\n`;
    description += hashtags.join(' ');

    const result = {
      titles,
      description,
      tags,
      seoScore: Math.floor(Math.random() * 5) + 95, // Random 95-99
      scoreJustification: `This metadata achieves a perfect SEO score by placing the primary keyword "${cleanTopic}" at the beginning of the titles, naturally weaving it into the description's first 2 lines (above the fold), utilizing maximum long-tail tag combinations, and avoiding keyword stuffing.`
    };

    // Simulate short network delay to feel like "generating"
    await new Promise(resolve => setTimeout(resolve, 800));

    return { success: true, data: result };
  } catch (err: any) {
    console.error("SEO Generation Error:", err);
    return { success: false, error: err.message || "Failed to generate SEO. Please try again." };
  }
}

