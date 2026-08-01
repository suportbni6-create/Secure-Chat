export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  timestamp: number;
  delivered: boolean;
  read: boolean;
}

export interface ChatUser {
  uid: string;
  lastSeen: number;
  isOnline: boolean;
}

export interface CallData {
  type: 'offer' | 'answer';
  sdp: string;
  caller: string;
  receiver: string;
  timestamp: number;
}
