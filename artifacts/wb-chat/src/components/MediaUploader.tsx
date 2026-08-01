import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Video, Mic, Paperclip } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { uploadToCloudinary } from '../cloudinary/uploader';

interface MediaUploaderProps {
  onUploadStart: () => void;
  onUploadComplete: (type: 'image' | 'video', url: string) => void;
  onUploadError: (err: any) => void;
  onRecordVoice: () => void;
}

export default function MediaUploader({ onUploadStart, onUploadComplete, onUploadError, onRecordVoice }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadStart();
    try {
      const url = await uploadToCloudinary(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      onUploadComplete(type, url);
    } catch (err) {
      onUploadError(err);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Paperclip className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-auto p-2 bg-popover/90 backdrop-blur-md border-border">
        <div className="flex gap-2">
          <button 
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors w-16"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.capture = 'environment';
                fileInputRef.current.click();
              }
            }}
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors w-16"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*,video/*';
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }
            }}
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
          </button>

          <button 
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors w-16"
            onClick={onRecordVoice}
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </PopoverContent>
    </Popover>
  );
}
