import { useEffect, useRef } from 'react';

export default function ScreenPreview({ stream, muted = true, autoPlay = true }: { stream: MediaStream | null; muted?: boolean; autoPlay?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full aspect-video bg-black/40 rounded-xl flex items-center justify-center border border-white/10 glass-card">
        <p className="text-white/50 text-lg font-mono tracking-wider">Waiting for stream...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl neon-glow border border-[#00f5ff]/30">
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">
          LIVE
        </span>
      </div>
    </div>
  );
}
