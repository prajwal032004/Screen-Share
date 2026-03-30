// lib/webrtc.ts
import { socket } from './socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    ...(process.env.NEXT_PUBLIC_TURN_SERVER_URL ? [{
      urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD,
    }] : [])
  ]
};

export class WebRTCManager {
  public peerConnection: RTCPeerConnection | null = null;
  private isHost: boolean;
  private roomId: string;
  private onTrackCallback?: (stream: MediaStream) => void;

  constructor(isHost: boolean, roomId: string) {
    this.isHost = isHost;
    this.roomId = roomId;

    socket.on('signal:offer', async ({ offer, from }) => {
      if (this.isHost) return;
      if (!this.peerConnection) this.createPeerConnection(from);
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      socket.emit('signal:answer', { answer, to: from });
    });

    socket.on('signal:answer', async ({ answer }) => {
      if (!this.isHost || !this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('signal:ice', async ({ candidate }) => {
      if (!this.peerConnection) return;
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });
  }

  public createPeerConnection(peerId?: string) {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal:ice', { candidate: event.candidate, to: peerId || this.roomId });
      }
    };

    if (!this.isHost) {
      this.peerConnection.ontrack = (event) => {
        if (this.onTrackCallback && event.streams[0]) {
          this.onTrackCallback(event.streams[0]);
        }
      };
    }

    return this.peerConnection;
  }

  public onTrack(callback: (stream: MediaStream) => void) {
    this.onTrackCallback = callback;
  }

  public async createOffer(peerId?: string) {
    if (!this.peerConnection) this.createPeerConnection(peerId);
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    socket.emit('signal:offer', { offer, to: peerId, roomId: this.roomId });
  }

  public addStream(stream: MediaStream) {
    if (!this.peerConnection) this.createPeerConnection();
    stream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, stream);
    });
  }

  public cleanup() {
    socket.off('signal:offer');
    socket.off('signal:answer');
    socket.off('signal:ice');
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
