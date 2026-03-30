"use client";

import { useEffect, useState, use } from 'react';
import { socket } from '@/lib/socket';
import { WebRTCManager } from '@/lib/webrtc';
import ScreenPreview from '@/components/ScreenPreview';

export default function JoinPage({ params }: { params: Promise<{ roomId: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [vol, setVol] = useState(1);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  useEffect(() => {
    socket.connect();
    socket.emit('room:join', { roomId });

    const rtc = new WebRTCManager(false, roomId);
    
    rtc.onTrack((newStream) => {
      setStream(newStream);
      setStatus('connected');
    });

    socket.on('stream:ended', () => {
      setStatus('ended');
      setStream(null);
    });

    return () => {
      rtc.cleanup();
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div className="flex-1 flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black mb-1">Viewer Mode</h1>
          <p className="text-white/50 font-mono">Room: <span className="text-[#a855f7]">{roomId}</span></p>
        </div>
        
        {status === 'connecting' && (
          <div className="animate-pulse bg-yellow-500/20 text-yellow-500 px-4 py-1 rounded-full text-sm font-bold border border-yellow-500/30">
            Connecting to Host...
          </div>
        )}
        
        {status === 'ended' && (
          <div className="bg-red-500/20 text-red-500 px-4 py-1 rounded-full text-sm font-bold border border-red-500/30">
            Session Ended
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl glass-card rounded-2xl p-2 relative">
        {status === 'ended' ? (
           <div className="w-full aspect-video bg-black/60 rounded-xl flex items-center justify-center flex-col">
             <p className="text-white/50 text-xl font-mono tracking-wider mb-4">The host has stopped sharing.</p>
           </div>
        ) : (
          <div className="w-full h-full relative group">
            <ScreenPreview stream={stream} muted={false} autoPlay={true} />
            <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
               <div className="w-64 backdrop-blur-md bg-white/10 p-4 rounded-xl flex flex-col gap-2 border border-white/20">
                 <label className="text-xs font-bold text-white/70">Audio Volume</label>
                 <input 
                   type="range" 
                   min="0" max="1" step="0.01" 
                   value={vol}
                   onChange={(e) => {
                     setVol(parseFloat(e.target.value));
                     const video = document.querySelector('video');
                     if (video) video.volume = parseFloat(e.target.value);
                   }}
                   className="w-full accent-[#00f5ff]"
                 />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
