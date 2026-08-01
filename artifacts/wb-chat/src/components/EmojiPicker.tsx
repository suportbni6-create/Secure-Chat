import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '../hooks/useTheme';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Smile className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start" 
        className="w-auto p-0 border-none shadow-none bg-transparent"
      >
        <div className="shadow-xl rounded-xl overflow-hidden border border-border">
          <Picker 
            data={data} 
            onEmojiSelect={(e: any) => onSelect(e.native)} 
            theme={theme} 
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
