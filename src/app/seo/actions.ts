'use server';

import { GoogleGenAI } from '@google/genai';

export async function generateSeoAction(topic: string, contentType: 'Video' | 'Short') {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a master YouTube SEO algorithm expert. The user wants to make a highly viral ${contentType} about: "${topic}".
Generate a fully automatic, highly optimized SEO package designed to score 95-100 on SEO tools (like VidIQ or TubeBuddy).

Return ONLY a raw JSON object (no markdown, no \`\`\`json) with this exact schema:
{
  "titles": ["Catchy Viral Title 1", "Search-Optimized Title 2", "Clickable Title 3"],
  "description": "Full YouTube description. Include a strong 2-sentence hook, detailed body with keywords, timestamps (if it's a Video), and 3-5 relevant hashtags at the bottom.",
  "tags": ["long tail keyword 1", "broad keyword 2", "specific keyword 3", ... (generate 15-20 highly searched tags)],
  "seoScore": 99,
  "scoreJustification": "Brief explanation of why this metadata achieves a near-perfect SEO score based on keyword density, CTR potential, etc."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    let text = response.text || '';
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    text = text.trim();

    return { success: true, data: JSON.parse(text) };
  } catch (err: any) {
    console.error("Gemini API Error in Server Action:", err);
    return { success: false, error: err.message || "Failed to generate SEO. Please try again." };
  }
}
