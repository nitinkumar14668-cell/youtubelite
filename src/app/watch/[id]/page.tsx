"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactPlayer from 'react-player';
const Player: any = ReactPlayer;
import { fetchFromAPI } from '../../../services/youtube';
import VideoCard from '../../../components/VideoCard';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Watch() {
  const params = useParams();
  const id = params?.id as string;
  const [videoDetail, setVideoDetail] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const videoRes = await fetchFromAPI(`videos?part=snippet,statistics&id=${encodeURIComponent(id)}`);
        
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

        setRelatedVideos(relatedRes.items || []);
        setComments(commentRes.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!videoDetail) {
    return <div className="flex-1 p-8 text-center bg-[#0f0f0f] text-white">Video not found.</div>;
  }

  const { snippet, statistics } = videoDetail;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f0f] text-white">
      <div className="max-w-[1700px] mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 flex flex-col xl:flex-row gap-6">
        {/* Left Side: Video & Details */}
        <div className="flex-1 min-w-0">
          <div className="w-full aspect-video bg-black sm:rounded-xl overflow-hidden">
            <Player 
              url={`https://www.youtube.com/watch?v=${id}`} 
              controls 
              width="100%" 
              height="100%" 
              playing={true}
            />
          </div>
          
          <div className="py-4 px-4 sm:px-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-3">{snippet.title}</h1>
            
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              {/* Channel Info */}
              <div className="flex items-center justify-between w-full xl:w-auto">
                <div className="flex items-center gap-4">
                  <Link href={`/channel/${snippet.channelId}`}>
                    <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center font-bold text-lg hover:opacity-80 transition-opacity">
                      {snippet.channelTitle.charAt(0)}
                    </div>
                  </Link>
                  <div className="min-w-0 pr-4">
                    <Link href={`/channel/${snippet.channelId}`}>
                      <h2 className="font-semibold text-[15px] hover:text-[#aaaaaa] transition-colors truncate">{snippet.channelTitle}</h2>
                    </Link>
                    <p className="text-xs text-[#aaaaaa]">Subscribers hidden</p>
                  </div>
                </div>
                <button className="bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 shrink-0">
                  Subscribe
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 hide-scrollbar-on-mobile w-full xl:w-auto">
                <div className="flex items-center bg-[#272727] rounded-full overflow-hidden shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#3f3f3f] border-r border-[#3f3f3f]">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(statistics.likeCount || 0)}
                    </span>
                  </button>
                  <button className="px-4 py-2 hover:bg-[#3f3f3f]">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full shrink-0">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Share</span>
                </button>
                <button className="flex items-center gap-2 bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full shrink-0">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Download</span>
                </button>
                <button className="bg-[#272727] hover:bg-[#3f3f3f] p-2 rounded-full shrink-0">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-4 bg-[#272727] hover:bg-[#3f3f3f] cursor-pointer rounded-xl p-3 text-sm transition-colors relative"
            >
              <div className="font-semibold flex gap-2">
                <span>{Intl.NumberFormat('en-US').format(statistics.viewCount || 0)} views</span>
                <span>{formatDistanceToNow(new Date(snippet.publishedAt), { addSuffix: true })}</span>
              </div>
              <p className={`mt-2 text-[#e5e5e5] whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                {snippet.description}
              </p>
              {snippet.description && snippet.description.length > 150 && (
                <button 
                  className="mt-2 font-semibold text-white hover:underline focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                {Intl.NumberFormat('en-US').format(statistics.commentCount || 0)} Comments
              </h3>
              
              <div className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                  U
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    className="w-full bg-transparent border-b border-[#3f3f3f] focus:border-white outline-none py-1 text-sm transition-colors" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {comments.map((comment, index) => {
                  const commentData = comment.snippet.topLevelComment.snippet;
                  return (
                    <div key={index} className="flex gap-4">
                      <Link href={`/channel/${commentData.authorChannelId?.value || ''}`}>
                        <img 
                          src={commentData.authorProfileImageUrl} 
                          alt=""
                          className="w-10 h-10 rounded-full shrink-0 bg-[#272727] hover:opacity-80 transition-opacity"
                        />
                      </Link>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/channel/${commentData.authorChannelId?.value || ''}`}>
                            <span className="font-medium text-sm text-white hover:text-[#aaaaaa] transition-colors">
                              {commentData.authorDisplayName}
                            </span>
                          </Link>
                          <span className="text-xs text-[#aaaaaa]">
                            {formatDistanceToNow(new Date(commentData.publishedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p 
                          className="text-sm text-[#e5e5e5] mb-2"
                          dangerouslySetInnerHTML={{ __html: commentData.textDisplay }}
                        />
                        <div className="flex items-center gap-4 text-[#aaaaaa]">
                          <button className="flex items-center gap-1 hover:text-white">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="text-xs">{commentData.likeCount > 0 ? commentData.likeCount : ''}</span>
                          </button>
                          <button className="hover:text-white">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button className="text-xs font-medium hover:bg-[#272727] py-1 px-3 rounded-full">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Related Videos */}
        <div className="w-full xl:w-[400px] shrink-0 px-4 sm:px-0 mt-6 xl:mt-0 pb-10">
          <div className="flex flex-col gap-3">
            {relatedVideos.map((video, idx) => (
              <VideoCard key={idx} video={video} layout="row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
