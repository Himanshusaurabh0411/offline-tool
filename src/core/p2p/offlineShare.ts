// WebRTC Peer-to-Peer file sharing without intermediate signaling servers
// Signaling is performed via offline QR code or manual token exchange

export interface PeerShareProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
  fileName: string;
}

export class OfflineShareSession {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onStatusChange?: (status: string) => void;
  private onProgress?: (progress: PeerShareProgress) => void;
  private onFileReceived?: (file: File) => void;

  constructor(
    onStatusChange?: (status: string) => void,
    onProgress?: (progress: PeerShareProgress) => void,
    onFileReceived?: (file: File) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onProgress = onProgress;
    this.onFileReceived = onFileReceived;
  }

  // Sender: Create Offer
  public async createSenderOffer(): Promise<string> {
    this.peerConnection = new RTCPeerConnection({ iceServers: [] });

    this.dataChannel = this.peerConnection.createDataChannel('offlineforge-transfer', {
      ordered: true,
    });
    this.setupDataChannel(this.dataChannel);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return new Promise((resolve) => {
      if (this.peerConnection!.iceGatheringState === 'complete') {
        resolve(JSON.stringify(this.peerConnection!.localDescription));
      } else {
        const checkState = () => {
          if (this.peerConnection?.iceGatheringState === 'complete') {
            this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
            resolve(JSON.stringify(this.peerConnection.localDescription));
          }
        };
        this.peerConnection!.addEventListener('icegatheringstatechange', checkState);
        // Fallback timeout
        setTimeout(() => {
          resolve(JSON.stringify(this.peerConnection?.localDescription));
        }, 1500);
      }
    });
  }

  // Receiver: Accept Offer and Generate Answer
  public async acceptOfferAndCreateAnswer(offerJson: string): Promise<string> {
    this.peerConnection = new RTCPeerConnection({ iceServers: [] });

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    const offer = JSON.parse(offerJson);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return new Promise((resolve) => {
      if (this.peerConnection!.iceGatheringState === 'complete') {
        resolve(JSON.stringify(this.peerConnection!.localDescription));
      } else {
        const checkState = () => {
          if (this.peerConnection?.iceGatheringState === 'complete') {
            this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
            resolve(JSON.stringify(this.peerConnection.localDescription));
          }
        };
        this.peerConnection!.addEventListener('icegatheringstatechange', checkState);
        setTimeout(() => {
          resolve(JSON.stringify(this.peerConnection?.localDescription));
        }, 1500);
      }
    });
  }

  // Sender: Finalize Answer from Receiver
  public async finalizeAnswer(answerJson: string): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection initialized');
    const answer = JSON.parse(answerJson);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    if (this.onStatusChange) this.onStatusChange('Connected! Ready for peer-to-peer file transfer.');
  }

  // Send File over DataChannel
  public async sendFile(file: File): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Peer connection data channel is not open.');
    }

    // 1. Send Header Metadata
    const header = JSON.stringify({
      type: 'FILE_HEADER',
      name: file.name,
      size: file.size,
      mime: file.type,
    });
    this.dataChannel.send(header);

    // 2. Stream File Chunks (16KB chunks)
    const chunkSize = 16384;
    const arrayBuffer = await file.arrayBuffer();
    const totalBytes = arrayBuffer.byteLength;
    let offset = 0;

    while (offset < totalBytes) {
      const slice = arrayBuffer.slice(offset, offset + chunkSize);
      this.dataChannel.send(slice);
      offset += slice.byteLength;

      if (this.onProgress) {
        this.onProgress({
          bytesTransferred: offset,
          totalBytes,
          percent: Math.round((offset / totalBytes) * 100),
          fileName: file.name,
        });
      }

      // Buffer flow control
      if (this.dataChannel.bufferedAmount > 65536) {
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    this.dataChannel.send(JSON.stringify({ type: 'FILE_EOF' }));
  }

  private setupDataChannel(channel: RTCDataChannel) {
    let receivingMeta: { name: string; size: number; mime: string } | null = null;
    let receivedChunks: ArrayBuffer[] = [];
    let receivedBytes = 0;

    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      if (this.onStatusChange) this.onStatusChange('Connected peer-to-peer! Ready to transfer.');
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'FILE_HEADER') {
            receivingMeta = msg;
            receivedChunks = [];
            receivedBytes = 0;
            if (this.onStatusChange) this.onStatusChange(`Receiving ${msg.name}...`);
          } else if (msg.type === 'FILE_EOF' && receivingMeta) {
            const blob = new Blob(receivedChunks, { type: receivingMeta.mime });
            const file = new File([blob], receivingMeta.name, { type: receivingMeta.mime });
            if (this.onFileReceived) this.onFileReceived(file);
            if (this.onStatusChange) this.onStatusChange(`Received ${receivingMeta.name} successfully!`);
            receivingMeta = null;
            receivedChunks = [];
          }
        } catch {}
      } else if (event.data instanceof ArrayBuffer && receivingMeta) {
        receivedChunks.push(event.data);
        receivedBytes += event.data.byteLength;
        if (this.onProgress) {
          this.onProgress({
            bytesTransferred: receivedBytes,
            totalBytes: receivingMeta.size,
            percent: Math.round((receivedBytes / receivingMeta.size) * 100),
            fileName: receivingMeta.name,
          });
        }
      }
    };
  }

  public close() {
    this.dataChannel?.close();
    this.peerConnection?.close();
  }
}
