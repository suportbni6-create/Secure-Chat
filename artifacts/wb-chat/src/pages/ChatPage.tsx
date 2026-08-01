import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Video, Send, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useTheme } from '../hooks/useTheme';
import { useWebRTC } from '../webrtc/useWebRTC';
import { markMessagesAsRead, registerUser, subscribeToUsers, setOffline, subscribeToCall } from '../firebase/firestore';
import { ChatUser, CallData } from '../types';

import MessageBubble from '../components/MessageBubble';
import MediaUploader from '../components/MediaUploader';
import VoiceRecorder from '../components/VoiceRecorder';
import EmojiPicker from '../components/EmojiPicker';
import CallOverlay from '../components/CallOverlay';

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, sendTextMessage, sendMediaMessage } = useChat(user?.uid);
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [partner, setPartner] = useState<ChatUser | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  const webrtc = useWebRTC(user?.uid || '');

  // Register presence and listen for calls
  useEffect(() => {
    if (!user) return;
    registerUser(user.uid);
    
    const handleUnload = () => setOffline(user.uid);
    window.addEventListener('beforeunload', handleUnload);

    const unsubUsers = subscribeToUsers((users) => {
      const p = users.find(u => u.uid !== user.uid);
      if (p) setPartner(p);
    });

    const unsubCall = subscribeToCall((data) => {
      setCallData(data);
    });

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      setOffline(user.uid);
      unsubUsers();
      unsubCall();
    };
  }, [user]);

  // Mark as read
  useEffect(() => {
    if (!user) return;
    markMessagesAsRead(user.uid);
  }, [messages, user]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendText = async () => {
    if (!text.trim()) return;
    await sendTextMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Call handlers
  const handleStartCall = () => {
    webrtc.startCall();
  };

  if (!user) return null; // Let App.tsx redirect

  return (
    <div className="flex flex-col h-[100dvh] bg-background relative overflow-hidden">
      
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 bg-card/80 backdrop-blur-xl border-b border-border z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-lg">
            WB
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Partner</span>
            {partner?.isOnline ? (
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Online
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Offline</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleStartCall}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <Video className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
        style={{
          // Subtle texture
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user.uid;
          const showTail = i === messages.length - 1 || messages[i + 1]?.senderId !== msg.senderId;
          return (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isMe={isMe} 
              showTail={showTail}
            />
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-serif text-3xl">WB</span>
            </div>
            <p className="text-sm tracking-widest uppercase">End-to-End Encrypted</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-background via-background to-transparent pt-8">
        {isRecording ? (
          <VoiceRecorder 
            onCancel={() => setIsRecording(false)} 
            onSend={(url) => {
              sendMediaMessage('audio', url);
              setIsRecording(false);
            }} 
          />
        ) : (
          <div className="flex items-end gap-2 bg-card border border-border shadow-lg rounded-3xl p-1.5 pl-3">
            <EmojiPicker onSelect={(e) => setText(prev => prev + e)} />
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="flex-1 max-h-32 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none py-2.5 text-[15px] leading-relaxed scrollbar-hide"
              rows={1}
              style={{ minHeight: '44px' }}
            />

            <MediaUploader 
              onUploadStart={() => {}} // Could show a loading toast
              onUploadComplete={(type, url) => sendMediaMessage(type, url)}
              onUploadError={(err) => console.error(err)}
              onRecordVoice={() => setIsRecording(true)}
            />

            {text.trim() && (
              <button 
                onClick={handleSendText}
                className="w-10 h-10 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity mb-0.5 mr-0.5"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Call Overlay */}
      <CallOverlay webrtc={webrtc} callData={callData} />

    </div>
  );
}
