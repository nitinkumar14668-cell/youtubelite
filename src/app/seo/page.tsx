"use client";

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Video, PlaySquare, Copy, CheckCircle2, ChevronRight, BarChart, Tag } from 'lucide-react';

export default function SEOPage() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<'Video' | 'Short'>('Video');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateSEO = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or video idea.");
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable. Please add your Gemini API Key in the settings.");
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
      // Clean up potential markdown formatting if the model disobeys
      if (text.startsWith('```json')) text = text.replace(/```json/g, '');
      if (text.startsWith('```')) text = text.replace(/```/g, '');
      text = text.trim();

      const jsonResult = JSON.parse(text);
      setResult(jsonResult);
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setError(err.message || "Failed to generate SEO. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#0f0f0f] text-white custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Auto SEO Engine</h1>
            <p className="text-[#aaaaaa] mt-1">Generate viral titles, descriptions, and tags with a 90-100 SEO score.</p>
          </div>
        </div>

        <div className="bg-[#272727] rounded-2xl p-6 mb-8 border border-[#3f3f3f]">
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-[#aaaaaa] mb-2">What is your video about?</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to cook perfect scrambled eggs, or Python tutorial for beginners 2024..."
                className="w-full bg-[#181818] border border-[#3f3f3f] rounded-xl p-4 text-white placeholder-[#777777] focus:outline-none focus:border-blue-500 transition-colors resize-none h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#aaaaaa] mb-2">Content Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setContentType('Video')}
                  className={`flex-1 py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-medium transition-all ${contentType === 'Video' ? 'bg-blue-600 text-white border-2 border-blue-500' : 'bg-[#181818] text-[#aaaaaa] border-2 border-transparent hover:bg-[#3f3f3f]'}`}
                >
                  <Video className="w-5 h-5" /> Long-form Video
                </button>
                <button
                  onClick={() => setContentType('Short')}
                  className={`flex-1 py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-medium transition-all ${contentType === 'Short' ? 'bg-red-600 text-white border-2 border-red-500' : 'bg-[#181818] text-[#aaaaaa] border-2 border-transparent hover:bg-[#3f3f3f]'}`}
                >
                  <PlaySquare className="w-5 h-5" /> YouTube Short
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 max-w-full text-red-500 p-4 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={generateSEO}
              disabled={loading}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Algorithm & Generating SEO...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Ultimate SEO Package
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
            <div className="bg-gradient-to-r from-[#272727] to-[#181818] rounded-2xl p-6 border border-[#3f3f3f] flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="44" className="stroke-[#3f3f3f] fill-none stroke-[8]"></circle>
                    <circle cx="48" cy="48" r="44" className="stroke-green-500 fill-none stroke-[8] stroke-dasharray-[276] stroke-dashoffset-[27]" style={{strokeDashoffset: 276 - (276 * result.seoScore) / 100}}></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-green-400">{result.seoScore}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><BarChart className="w-5 h-5 text-green-400"/> Excellent SEO Score</h3>
                  <p className="text-[#aaaaaa] text-sm leading-relaxed">{result.scoreJustification}</p>
                </div>
              </div>
            </div>

            {/* Titles */}
            <div className="bg-[#272727] rounded-2xl p-6 border border-[#3f3f3f]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Viral Title Options
              </h3>
              <div className="space-y-3">
                {result.titles.map((title: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#181818] rounded-xl hover:bg-[#3f3f3f] transition-colors group">
                    <span className="font-medium pr-4">{title}</span>
                    <button 
                      onClick={() => copyToClipboard(title, `title-${index}`)}
                      className="text-[#aaaaaa] hover:text-white p-2"
                    >
                      {copiedField === `title-${index}` ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#272727] rounded-2xl p-6 border border-[#3f3f3f]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" /> Optimized Description
                </h3>
                <button 
                  onClick={() => copyToClipboard(result.description, 'description')}
                  className="flex items-center gap-2 text-sm text-[#aaaaaa] hover:text-white bg-[#181818] px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedField === 'description' ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All</>}
                </button>
              </div>
              <div className="bg-[#181818] p-5 rounded-xl whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-mono custom-scrollbar max-h-96 overflow-y-auto">
                {result.description}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[#272727] rounded-2xl p-6 border border-[#3f3f3f]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-400" /> High-Ranking Tags
                </h3>
                <button 
                  onClick={() => copyToClipboard(result.tags.join(', '), 'tags')}
                  className="flex items-center gap-2 text-sm text-[#aaaaaa] hover:text-white bg-[#181818] px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedField === 'tags' ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All Tags</>}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag: string, index: number) => (
                  <div key={index} className="bg-[#181818] text-gray-300 px-3 py-1.5 rounded-lg text-sm border border-[#3f3f3f]">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

