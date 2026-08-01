import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Play, Pause } from 'lucide-react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import ImageLightbox from './ImageLightbox';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showTail?: boolean;
}

export default function MessageBubble({ message, isMe, showTail = true }: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeStr = format(new Date(message.timestamp), 'HH:mm');

  const bubbleClasses = cn(
    'relative max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-[15px] leading-snug',
    isMe
      ? 'bg-primary text-primary-foreground rounded-tr-sm'
      : 'bg-card text-card-foreground border border-border rounded-tl-sm'
  );

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
      case 'image':
        return (
          <div className="flex flex-col gap-1">
            <img 
              src={message.mediaUrl} 
              alt="Attachment" 
              className="max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setLightboxOpen(true)}
            />
            {message.text && <p className="whitespace-pre-wrap break-words mt-1">{message.text}</p>}
            {lightboxOpen && (
              <ImageLightbox src={message.mediaUrl!} onClose={() => setLightboxOpen(false)} />
            )}
          </div>
        );
      case 'video':
        return (
          <div className="flex flex-col gap-1">
            <video src={message.mediaUrl} controls className="max-h-60 rounded-xl object-cover" />
            {message.text && <p className="whitespace-pre-wrap break-words mt-1">{message.text}</p>}
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-xl p-2">
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0"
              onClick={() => {
                // Simplified audio play for now
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <div className="flex-1 h-1.5 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/3" /> {/* Fake progress */}
            </div>
            {message.mediaUrl && isPlaying && (
              <audio src={message.mediaUrl} autoPlay onEnded={() => setIsPlaying(false)} className="hidden" />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex w-full mb-1', isMe ? 'justify-end' : 'justify-start')}>
      <div className={bubbleClasses}>
        {renderContent()}
        <div className={cn(
          'flex items-center justify-end gap-1 mt-1 text-[11px] opacity-70',
          isMe ? 'text-primary-foreground' : 'text-muted-foreground'
        )}>
          <span>{timeStr}</span>
          {isMe && (
            message.read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
}
