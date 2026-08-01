import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white/70 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      <img 
        src={src} 
        alt="Fullscreen" 
        className="max-w-full max-h-[100dvh] object-contain"
      />
    </div>
  );
}
