"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Mic, MicOff, Video, VideoOff, Settings, Circle, MessageSquare, Share2, X, Send, User, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BroadcastPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState<{user: string, text: string, color: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setError('');
    }
  };

  // Initialize media devices
  useEffect(() => {
    let localStream: MediaStream | null = null;
    async function setupStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: true 
        });
        localStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Error accessing media devices:", err);
        setError("Could not access camera/microphone. Please allow permissions.");
      }
    }
    setupStream();

    return () => {
      // Cleanup stream on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer and mock viewer logic
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isLive) {
      timerId = setInterval(() => {
        setLiveDuration(prev => prev + 1);
        
        // Randomly simulate viewers joining/leaving
        setViewers(prev => {
          const change = Math.floor(Math.random() * 5) - 1; // -1 to +3
          return Math.max(1, prev + change);
        });
        
        // Simulate chat messages
        if (Math.random() > 0.6) {
          const mockUsers = ['GamerPro', 'TechFan', 'MusicLover', 'YT_Watcher', 'Nitin', 'CoolKid', 'StreamerFan'];
          const mockTexts = ['Hello!', 'Awesome stream', 'What game is this?', 'Bro is actually live', 'Nice setup', 'W stream', 'pog'];
          const colors = ['text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400'];
          
          setChatMessages(prev => [...prev, {
            user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
            text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
            color: colors[Math.floor(Math.random() * colors.length)]
          }].slice(-50));
        }
        
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isLive]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, {
      user: 'You (Creator)',
      text: chatInput,
      color: 'text-yellow-500'
    }].slice(-50));
    setChatInput('');
  };

  const stopStreamAndLeave = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    router.push('/');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col relative h-[50vh] lg:h-full border-r border-[#272727]">
        {!stream && !uploadedVideoUrl && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Accessing Camera...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 z-20 px-6 text-center">
            <Camera className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-xl font-bold text-red-500 mb-2">Camera Access Denied</p>
            <p className="text-gray-400 mb-6">{error}</p>
            <button onClick={stopStreamAndLeave} className="px-6 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full">
              Back to Home
            </button>
          </div>
        )}

        <video 
          ref={videoRef}
          src={uploadedVideoUrl || undefined}
          autoPlay 
          playsInline 
          muted={!uploadedVideoUrl || isMuted} 
          loop={!!uploadedVideoUrl}
          className={`w-full h-full object-cover bg-black ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
          onLoadedData={() => {
            if (uploadedVideoUrl && videoRef.current) {
              videoRef.current.play();
            }
          }}
        />
        
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1f1f1f]">
            <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
              U
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex gap-3">
          {isLive && (
            <div className="bg-red-600 text-white px-2.5 py-1 rounded text-sm font-bold flex items-center gap-1.5 animate-pulse shadow-lg">
              LIVE {formatDuration(liveDuration)}
            </div>
          )}
          {isLive && (
            <div className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded flex items-center gap-1.5 text-sm font-semibold">
              <User className="w-4 h-4" /> {viewers}
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={toggleMute}
                className={`p-3.5 rounded-full backdrop-blur-md transition-colors ${isMuted ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button 
                onClick={toggleVideo}
                className={`p-3.5 rounded-full backdrop-blur-md transition-colors ${isVideoOff ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
              <button className="hidden sm:flex p-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <button className="hidden sm:flex p-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors">
                 <Share2 className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex gap-3 items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="video/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              {!isLive && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex px-4 py-3 bg-[#272727] hover:bg-[#3f3f3f] rounded-full font-bold uppercase tracking-wider items-center gap-2 shadow-lg transition-all"
                  title="Upload pre-recorded video"
                >
                  <Upload className="w-5 h-5 text-white" />
                  <span className="hidden sm:inline text-white text-xs">Simulate</span>
                </button>
              )}
              {!isLive ? (
                <button 
                  onClick={() => setIsLive(true)}
                  disabled={(!stream && !uploadedVideoUrl) || !!error}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                >
                  <Circle className="w-5 h-5 fill-white" /> Go Live
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsLive(false);
                    setLiveDuration(0);
                    setViewers(0);
                    setChatMessages([]);
                  }}
                  className="px-6 py-3 bg-[#272727] hover:bg-[#3f3f3f] rounded-full font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  End Stream
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 lg:w-[350px] lg:flex-none flex flex-col bg-[#0f0f0f] h-[50vh] lg:h-full border-t lg:border-t-0 border-[#272727]">
        <div className="p-4 border-b border-[#272727] flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Live Chat
          </h2>
          <button className="p-2 hover:bg-[#272727] rounded-full lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={chatRef}>
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {isLive ? 'Welcome to live chat! Say hello.' : 'Chat is disabled before going live.'}
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[14px] leading-relaxed break-words"
              >
                <span className={`font-medium mr-2 ${msg.color}`}>{msg.user}</span>
                <span className="text-gray-200">{msg.text}</span>
              </motion.div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-[#272727] bg-[#1a1a1a]">
          <form onSubmit={sendChatMessage} className="flex gap-2">
            <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 shadow-lg">
              U
            </div>
            <div className="flex-1 bg-[#272727] rounded-full flex items-center px-4">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Chat openly as You..."
                disabled={!isLive}
                className="w-full bg-transparent border-none focus:outline-none text-sm py-2 disabled:opacity-50"
              />
            </div>
            <button 
              type="submit"
              disabled={!isLive || !chatInput.trim()}
              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
