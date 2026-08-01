import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createCallOffer,
  answerCall,
  subscribeToCall,
  endFirebaseCall,
  addIceCandidate,
  subscribeToIceCandidates,
} from '../firebase/firestore';
import { CallData } from '../types';

export const useWebRTC = (myUid: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const unsubCallRef = useRef<(() => void) | null>(null);
  const unsubIceRef = useRef<(() => void) | null>(null);

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices', err);
      return null;
    }
  };

  const createPeerConnection = (stream: MediaStream, role: 'caller' | 'receiver') => {
    const pc = new RTCPeerConnection(servers);
    peerConnection.current = pc;

    // Add local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addIceCandidate('active', event.candidate, role);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    return pc;
  };

  const startCall = async () => {
    const stream = await setupMedia();
    if (!stream) return;

    setCallStatus('calling');
    const pc = createPeerConnection(stream, 'caller');

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await createCallOffer({
      type: 'offer',
      sdp: JSON.stringify(offer),
      caller: myUid,
      receiver: 'partner', // simplified
    });

    unsubIceRef.current = subscribeToIceCandidates('receiver', (candidateData) => {
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidateData));
      }
    });
  };

  const acceptCall = async (offerData: CallData) => {
    const stream = await setupMedia();
    if (!stream) return;

    setCallStatus('connected');
    const pc = createPeerConnection(stream, 'receiver');

    const offer = JSON.parse(offerData.sdp);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await answerCall({
      type: 'answer',
      sdp: JSON.stringify(answer),
      caller: offerData.caller,
      receiver: myUid,
    });

    unsubIceRef.current = subscribeToIceCandidates('caller', (candidateData) => {
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidateData));
      }
    });
  };

  const rejectCall = async () => {
    await endFirebaseCall();
    setCallStatus('idle');
  };

  const endCall = useCallback(async () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsConnected(false);
    setCallStatus('idle');

    if (unsubIceRef.current) unsubIceRef.current();

    await endFirebaseCall();
  }, [localStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsCameraOn(!isCameraOn);
    }
  };

  const switchCamera = async () => {
    // Implement device switching if needed, complex for now
  };

  useEffect(() => {
    if (!myUid) return;

    unsubCallRef.current = subscribeToCall(async (data) => {
      if (data) {
        if (data.type === 'offer' && data.caller !== myUid) {
          setCallStatus('incoming');
        } else if (data.type === 'answer' && data.caller === myUid) {
          if (peerConnection.current) {
            const answer = JSON.parse(data.sdp);
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        }
      } else {
        // Call ended remotely
        if (callStatus !== 'idle') {
          endCall();
        }
      }
    });

    return () => {
      if (unsubCallRef.current) unsubCallRef.current();
    };
  }, [myUid, callStatus, endCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isCameraOn,
    callStatus,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera
  };
};
