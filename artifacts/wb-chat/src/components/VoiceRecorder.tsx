import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { uploadToCloudinary } from '../cloudinary/uploader';

interface VoiceRecorderProps {
  onCancel: () => void;
  onSend: (url: string) => void;
}

export default function VoiceRecorder({ onCancel, onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        chunks.current = [];
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      timerInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    try {
      const file = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });
      const url = await uploadToCloudinary(file);
      onSend(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-card border border-border rounded-full px-4 py-2 shadow-sm animate-in slide-in-from-bottom-2">
      <button onClick={onCancel} className="text-muted-foreground p-1 hover:text-foreground">
        <X className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center justify-center gap-2">
        {isRecording && <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />}
        <span className="text-sm font-mono">{formatTime(duration)}</span>
      </div>

      {!audioBlob ? (
        <button 
          onClick={stopRecording}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <Square className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={handleSend}
          disabled={isUploading}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      )}
    </div>
  );
}
