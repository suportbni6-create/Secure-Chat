import { useState, useEffect } from 'react';
import { subscribeToMessages, sendMessage as fsSendMessage } from '../firebase/firestore';
import { Message, MessageType } from '../types';

export const useChat = (myUid: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!myUid) return;
    
    const unsub = subscribeToMessages((msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsub();
  }, [myUid]);

  const sendTextMessage = async (text: string) => {
    if (!myUid) return;
    await fsSendMessage(myUid, text, 'text');
  };

  const sendMediaMessage = async (type: MessageType, url: string, text: string = '') => {
    if (!myUid) return;
    await fsSendMessage(myUid, text, type, url);
  };

  return {
    messages,
    isLoading,
    sendTextMessage,
    sendMediaMessage
  };
};
