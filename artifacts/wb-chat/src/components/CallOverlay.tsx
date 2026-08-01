import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, SwitchCamera } from 'lucide-react';
import { useWebRTC } from '../webrtc/useWebRTC';
import { CallData } from '../types';

interface CallOverlayProps {
  webrtc: ReturnType<typeof useWebRTC>;
  callData: CallData | null;
}

export default function CallOverlay({ webrtc, callData }: CallOverlayProps) {
  const {
    localStream,
    remoteStream,
    isMuted,
    isCameraOn,
    callStatus,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera
  } = webrtc;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callStatus === 'idle') return null;

  // Incoming Call State
  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-serif text-white shadow-lg">
            WB
          </div>
        </div>
        <h2 className="text-3xl font-light text-white mb-2">Partner</h2>
        <p className="text-white/60 mb-16 tracking-widest uppercase text-sm">Incoming Video Call</p>
        
        <div className="flex items-center gap-12">
          <button 
            onClick={rejectCall}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-destructive/20">
              <PhoneOff className="w-7 h-7" />
            </div>
            <span className="text-white/70 text-sm">Decline</span>
          </button>
          
          <button 
            onClick={() => callData && acceptCall(callData)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20 animate-bounce">
              <Video className="w-7 h-7" />
            </div>
            <span className="text-white/70 text-sm">Accept</span>
          </button>
        </div>
      </div>
    );
  }

  // Calling or Connected State
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      
      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {remoteStream ? (
          <video 
            ref={remoteVideoRef}
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/40 flex flex-col items-center animate-pulse">
            <Video className="w-12 h-12 mb-4 opacity-50" />
            <p className="tracking-widest uppercase text-sm">Connecting...</p>
          </div>
        )}
      </div>

      {/* Local Video (PiP) */}
      <div className="absolute top-4 right-4 w-28 h-40 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10">
        {localStream ? (
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <VideoOff className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-8 z-10">
        <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          
          <button 
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isCameraOn ? 'bg-white/20 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white/20 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button 
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center text-white shadow-lg shadow-destructive/30 hover:scale-105 transition-transform ml-2"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

        </div>
      </div>

    </div>
  );
}
