"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { socket } from '@/lib/socket';
import { WebRTCManager } from '@/lib/webrtc';
import ScreenPreview from '@/components/ScreenPreview';
import AudioVisualizer from '@/components/AudioVisualizer';
import RoomControls from '@/components/RoomControls';

export default function HostPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [rtcManager, setRtcManager] = useState<WebRTCManager | null>(null);

  useEffect(() => {
    socket.connect();
    
    // Generate UUID room
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);

    const rtc = new WebRTCManager(true, id);
    setRtcManager(rtc);

    const hostUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : '';
    QRCode.toDataURL(hostUrl, {
      color: { dark: '#00f5ff', light: '#0a0a0f' },
      margin: 2
    }).then(setQrCodeData);

    socket.emit('room:create', { roomId: id });

    socket.on('peer:joined', async ({ peerId }) => {
      console.log('Peer joined:', peerId);
      await rtc.createOffer(peerId);
    });

    return () => {
      rtc.cleanup();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (stream && rtcManager) {
      rtcManager.addStream(stream);
    }
  }, [stream, rtcManager]);

  const startShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: { ideal: 1920 } },
        audio: { echoCancellation: false, noiseSuppression: false, sampleRate: 44100 }
      });
      setStream(mediaStream);

      mediaStream.getVideoTracks()[0].onended = () => {
        stopShare();
      };
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const stopShare = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    socket.emit('stream:ended', { roomId });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row p-6 gap-6">
      <div className="flex-1 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold flexitems-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#00f5ff] neon-glow block"></span>
            Host Session
          </h1>
          {roomId && (
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="text-white/50 text-sm">Room ID</span>
              <span className="font-mono text-xl neon-text text-[#00f5ff] select-all cursor-pointer">
                {roomId}
              </span>
            </div>
          )}
        </div>

        <div className="w-full relative glass-card rounded-2xl p-2 border-[#00f5ff]/20">
          {!stream ? (
            <div className="aspect-video w-full rounded-xl flex flex-col items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors border-2 border-dashed border-white/20" onClick={startShare}>
              <button className="px-8 py-4 bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/50 font-bold rounded-2xl transition shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                Start Screen Share
              </button>
            </div>
          ) : (
            <>
              {/* @ts-ignore */}
              <ScreenPreview stream={stream} muted autoPlay />
              <RoomControls onStop={stopShare}>
                <AudioVisualizer stream={stream} />
              </RoomControls>
            </>
          )}
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-bold mb-4 text-[#a855f7]">Quick Join QR</h3>
          <div className="bg-black/50 p-4 rounded-xl flex items-center justify-center mb-4 min-h-[250px] aspect-square">
            {qrCodeData ? (
              <img src={qrCodeData} alt="Join LAN QR" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <span className="text-white/50">Generating...</span>
            )}
          </div>
          <p className="text-xs text-center text-white/50">
            Scan on your local network or share the link manually.
          </p>
        </div>
      </div>
    </div>
  );
}
