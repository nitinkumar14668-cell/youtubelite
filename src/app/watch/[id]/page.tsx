"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactPlayer from 'react-player';
const Player: any = ReactPlayer;
import { fetchFromAPI, resetApiKeys } from '../../../services/youtube';
import { enrichVideos } from '../../../lib/youtubeUtils';
import VideoCard from '../../../components/VideoCard';
import DummyAd from '../../../components/DummyAd';
import VideoOverlayAd from '../../../components/VideoOverlayAd';
import QuotaExceededComponent from '../../../components/QuotaExceeded';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Watch() {
  const params = useParams();
  const id = params?.id as string;
  const [videoDetail, setVideoDetail] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOverlayAd, setShowOverlayAd] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setQuotaExceeded(false);
    try {
      const videoRes = await fetchFromAPI(`videos?part=snippet,statistics&id=${encodeURIComponent(id)}`);
      if (videoRes?.error === "quota_exceeded") {
        setQuotaExceeded(true);
        return;
      }
      
      let videoData: any = null;
      if (videoRes.items && videoRes.items.length > 0) {
        videoData = videoRes.items[0];
        setVideoDetail(videoData);
      }

      // Fetch related videos (using title search as relatedToVideoId is deprecated) and comments in parallel
      const titleQuery = videoData ? encodeURIComponent(videoData.snippet.title) : 'recommended';
      
      const [relatedRes, commentRes] = await Promise.all([
        fetchFromAPI(`search?part=snippet&q=${titleQuery}&type=video&maxResults=15`).catch(() => ({ items: [] })),
        fetchFromAPI(`commentThreads?part=snippet&videoId=${encodeURIComponent(id)}&maxResults=20`).catch(() => ({ items: [] }))
      ]);

      const enrichedRelated = await enrichVideos(relatedRes.items || [], fetchFromAPI);
      setRelatedVideos(enrichedRelated);
      setComments(commentRes.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (quotaExceeded) {
    return (
      <div className="flex-1 bg-[#0f0f0f]">
        <QuotaExceededComponent onRetry={async () => {
           await resetApiKeys();
           fetchData();
        }} />
      </div>
    );
  }

  if (!videoDetail) {
    return <div className="flex-1 p-8 text-center bg-[#0f0f0f] text-white">Video not found.</div>;
  }

  let publishTimeAgo = '';
  if (videoDetail?.snippet?.publishedAt) {
    try {
      const dateObj = new Date(videoDetail.snippet.publishedAt);
      if (!isNaN(dateObj.getTime())) {
        publishTimeAgo = formatDistanceToNow(dateObj, { addSuffix: true });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const { snippet, statistics } = videoDetail;
  const viewCountNum = Number(statistics.viewCount) || 0;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f0f] text-white">
      <div className="max-w-[1700px] mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 flex flex-col xl:flex-row gap-6">
        {/* Left Side: Video & Details */}
        <div className="flex-1 min-w-0">
          <div className="w-full aspect-video bg-black sm:rounded-xl overflow-hidden sticky top-0 z-10 sm:relative">
            {showOverlayAd && <VideoOverlayAd onSkip={() => setShowOverlayAd(false)} />}
            <Player 
              url={`https://www.youtube.com/watch?v=${id}`} 
              controls 
              width="100%" 
              height="100%" 
              playing={!showOverlayAd}
            />
          </div>
          
          <div className="py-3 px-4 sm:px-0">
            <h1 className="text-[18px] sm:text-xl font-bold line-clamp-2 leading-tight mb-2">{snippet.title}</h1>
            
            {/* Description Preview (Collapsed) / Expanded Description */}
            {!isDescriptionExpanded ? (
              <div 
                className="flex flex-wrap items-center text-[13px] text-[#aaaaaa] mb-3 cursor-pointer"
                onClick={() => setIsDescriptionExpanded(true)}
              >
                <span className="truncate mr-2 font-medium">{snippet.channelTitle}</span>
                <span className="shrink-0 mr-1">{Intl.NumberFormat('en-US', { notation: "compact" }).format(viewCountNum)} views</span>
                <span className="shrink-0 font-bold text-white ml-1">...more</span>
              </div>
            ) : (
              <div 
                onClick={() => setIsDescriptionExpanded(false)}
                className="mt-2 mb-4 bg-[#272727] hover:bg-[#3f3f3f] cursor-pointer rounded-xl p-3 text-sm transition-colors relative"
              >
                <div className="font-semibold flex gap-2">
                  <span>{Intl.NumberFormat('en-US').format(viewCountNum)} views</span>
                  <span>{publishTimeAgo}</span>
                </div>
                <p className="mt-2 text-[#e5e5e5] whitespace-pre-wrap">
                  {snippet.description}
                </p>
                <button 
                  className="mt-2 font-semibold text-white hover:underline focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(false);
                  }}
                >
                  Show less
                </button>
              </div>
            )}

            {/* Actions & Channel Row */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar-on-mobile pb-2 mb-4">
              <Link href={`/channel/${snippet.channelId}`} className="shrink-0 relative mr-1">
                <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center font-bold text-base hover:opacity-80 transition-opacity">
                  {snippet.channelTitle.charAt(0)}
                </div>
              </Link>
              
              <button className="bg-white text-black px-4 py-1.5 rounded-full font-semibold text-sm shrink-0 mr-2 hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
              
              <div className="flex items-center bg-[#272727] rounded-full shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#3f3f3f] border-r border-[#3f3f3f] rounded-l-full transition-colors">
                  <ThumbsUp className="w-[18px] h-[18px]" />
                  <span className="text-sm font-medium">
                    {Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(statistics.likeCount || 0)}
                  </span>
                </button>
                <button className="px-3 py-1.5 hover:bg-[#3f3f3f] rounded-r-full transition-colors">
                  <ThumbsDown className="w-[18px] h-[18px]" />
                </button>
              </div>
              
              <button className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 rounded-full shrink-0 transition-colors">
                <Share2 className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              <button 
                onClick={() => setShowDownloadConfirm(true)}
                className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 rounded-full shrink-0 transition-colors"
              >
                <Download className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">Download</span>
              </button>
              
              <button className="bg-[#272727] hover:bg-[#3f3f3f] p-1.5 px-3 rounded-full shrink-0 transition-colors">
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Comments Preview Box (Mobile style format) */}
            <div className="bg-[#272727] hover:bg-[#3f3f3f] rounded-xl p-3 mb-6 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[15px]">Comments</span>
                  <span className="text-[#aaaaaa] text-sm">{Intl.NumberFormat('en-US', { notation: "compact" }).format(statistics.commentCount || 0)}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <div className="w-1 h-1 rounded-full bg-[#aaaaaa]"></div>
                  <div className="w-1 h-1 rounded-full bg-[#aaaaaa]"></div>
                  <div className="w-1 h-1 rounded-full bg-[#aaaaaa]"></div>
                </div>
              </div>
              
              {comments.length > 0 ? (
                <div className="flex gap-2 items-center">
                  <img 
                    src={comments[0].snippet.topLevelComment.snippet.authorProfileImageUrl} 
                    alt=""
                    className="w-6 h-6 rounded-full bg-[#333] shrink-0" 
                  />
                  <p 
                    className="text-[13px] line-clamp-1 flex-1 text-[#f1f1f1]" 
                    dangerouslySetInnerHTML={{ __html: comments[0].snippet.topLevelComment.snippet.textDisplay }} 
                  />
                </div>
              ) : (
                <div className="text-[13px] text-[#aaaaaa]">No comments yet</div>
              )}
            </div>

            {/* Hidden Desktop Full Comments implementation for now context
                We could show this on desktop via CSS, but matching screenshot usually means 
                the preview box is the primary interactive element.
            */}
          </div>
        </div>

        {/* Right Side: Related Videos */}
        <div className="w-full xl:w-[400px] shrink-0 px-4 sm:px-0 mt-2 xl:mt-0 pb-10">
          <div className="flex flex-col gap-3">
            {relatedVideos.map((video, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && idx % 5 === 2 && (
                  <DummyAd layout="row" />
                )}
                <VideoCard video={video} layout="row" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {showDownloadConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#272727] rounded-xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Download</h3>
            <p className="text-sm text-[#aaaaaa] mb-6">
              Are you sure you want to download &quot;{snippet.title}&quot;? This will save the video to your device.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowDownloadConfirm(false)}
                className="px-4 py-2 rounded-full font-medium text-white hover:bg-[#3f3f3f] transition-colors"
              >
                Cancel
              </button>
              <a 
                href={`/api/download?id=${id}`}
                download
                onClick={() => setShowDownloadConfirm(false)}
                className="px-4 py-2 rounded-full font-medium bg-white text-black hover:bg-gray-200 transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
